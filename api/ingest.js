import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role — never expose to browser
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { documentId, clientId, reprocess } = req.body

  if (!documentId || !clientId) {
    return res.status(400).json({ error: 'documentId and clientId are required' })
  }

  try {
    // 1. Fetch the document record from Supabase
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !doc) {
      return res.status(404).json({ error: 'Document not found' })
    }

    // ── Fast-path: re-process from existing raw_text (no storage download needed) ──
    // Used when the doc_type was corrected after initial ingest. Skips the download
    // and Claude call entirely — just re-parses the stored raw_text with the current
    // (corrected) doc_type and re-writes the structured rows.
    if (reprocess && doc.raw_text) {
      const structured = parseClaudeResponse(doc.raw_text, doc.doc_type)
      const results    = await writeExtractedData(structured, documentId, clientId, doc.doc_type)
      return res.status(200).json({
        success: true,
        documentId,
        docType:   doc.doc_type,
        extracted: structured,
        written:   results,
        source:    'raw_text_reparse',
      })
    }

    // 2. Download the file from Supabase Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('documents')
      .download(doc.file_path)

    if (fileError || !fileData) {
      return res.status(500).json({ error: 'Failed to download file from storage' })
    }

    // 3. Convert file to base64 for Claude
    const arrayBuffer = await fileData.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')
    const isPDF = doc.file_name.toLowerCase().endsWith('.pdf')
    const isImage = /\.(png|jpg|jpeg)$/i.test(doc.file_name)
    const isCSV = /\.(csv|xls|xlsx)$/i.test(doc.file_name)

    let extractedText = ''
    let structured = {}

    if (isPDF || isImage) {
      // 4a. Send to Claude as a document/image
      const mediaType = isPDF ? 'application/pdf' : fileData.type || 'image/png'

      const message = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: isPDF ? 'document' : 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: buildExtractionPrompt(doc.doc_type),
              },
            ],
          },
        ],
      })

      extractedText = message.content[0].text
      structured = parseClaudeResponse(extractedText, doc.doc_type)

    } else if (isCSV) {
      // 4b. For CSV/Excel send as text
      const textContent = Buffer.from(arrayBuffer).toString('utf-8')

      const message = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `${buildExtractionPrompt(doc.doc_type)}\n\nFile contents:\n\n${textContent.substring(0, 50000)}`,
          },
        ],
      })

      extractedText = message.content[0].text
      structured = parseClaudeResponse(extractedText, doc.doc_type)
    }

    // 5. Write extracted data to the appropriate tables
    const results = await writeExtractedData(structured, documentId, clientId, doc.doc_type)

    // 6. Mark document as processed
    await supabase
      .from('documents')
      .update({ processed: true, raw_text: extractedText.substring(0, 10000) })
      .eq('id', documentId)

    return res.status(200).json({
      success: true,
      documentId,
      docType: doc.doc_type,
      extracted: structured,
      written: results,
    })

  } catch (error) {
    console.error('Ingest error:', error)

    // Mark as failed
    await supabase
      .from('documents')
      .update({ processed: false, raw_text: `ERROR: ${error.message}` })
      .eq('id', documentId)

    return res.status(500).json({ error: error.message })
  }
}

// ── Prompt builder ─────────────────────────────────────────────────────────

function buildExtractionPrompt(docType) {
  const base = `You are a financial document parser for a family office portfolio management system.
Extract all structured data from this document and return ONLY valid JSON — no markdown, no explanation, just the raw JSON object.`

  const prompts = {
    capital_call: `${base}

Extract capital call information and return this exact JSON structure:
{
  "fund_name": "string",
  "manager": "string",
  "call_number": "string or null",
  "amount": number (in dollars, no commas),
  "due_date": "YYYY-MM-DD or null",
  "unfunded_remaining": number or null,
  "total_commitment": number or null,
  "account_number": "string or null",
  "wire_instructions": "string or null",
  "notes": "string or null"
}`,

    statement: `${base}

Extract account statement information and return this exact JSON structure:
{
  "account_name": "string",
  "account_number": "string or null",
  "custodian": "string or null",
  "as_of_date": "YYYY-MM-DD or null",
  "total_value": number or null,
  "holdings": [
    {
      "name": "string",
      "asset_class": "string",
      "market_value": number,
      "quantity": number or null,
      "price": number or null,
      "gain_loss": number or null,
      "return_pct": number or null
    }
  ]
}`,

    performance: `${base}

Extract performance report information and return this exact JSON structure:
{
  "fund_name": "string",
  "manager": "string or null",
  "as_of_date": "YYYY-MM-DD or null",
  "period": "string or null",
  "irr": number or null,
  "tvpi": number or null,
  "dpi": number or null,
  "rvpi": number or null,
  "gross_return": number or null,
  "net_return": number or null,
  "benchmark_return": number or null,
  "nav": number or null,
  "total_invested": number or null,
  "total_distributed": number or null
}`,

    alt_statement: `${base}

Extract alternative investment statement information and return this exact JSON structure:
{
  "fund_name": "string",
  "manager": "string or null",
  "as_of_date": "YYYY-MM-DD or null",
  "nav": number or null,
  "total_commitment": number or null,
  "called_capital": number or null,
  "unfunded_commitment": number or null,
  "distributions": number or null,
  "irr": number or null,
  "tvpi": number or null,
  "dpi": number or null,
  "vintage_year": number or null,
  "asset_class": "string or null"
}`,

    k1: `${base}

Extract K-1 tax document information and return this exact JSON structure:
{
  "partnership_name": "string",
  "ein": "string or null",
  "tax_year": number or null,
  "partner_name": "string or null",
  "ordinary_income": number or null,
  "net_rental_income": number or null,
  "interest_income": number or null,
  "dividends": number or null,
  "capital_gains_short": number or null,
  "capital_gains_long": number or null,
  "other_income": number or null,
  "distributions": number or null
}`,

    other: `${base}

Extract any financial data found in this document and return a JSON object with whatever fields are present. Include:
- document_type: your assessment of what type of document this is
- key_dates: array of important dates found
- key_amounts: array of {label, amount} objects for all dollar amounts found
- entities: array of company/fund names mentioned
- summary: one sentence description of what this document is`,
  }

  return prompts[docType] || prompts.other
}

// ── Response parser ────────────────────────────────────────────────────────

function parseClaudeResponse(text, docType) {
  try {
    // Strip any markdown code fences if Claude added them
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return JSON.parse(cleaned)
  } catch (e) {
    console.error('JSON parse failed, attempting extraction:', e.message)

    // Try to find JSON object in the response
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch (e2) {
        return { parse_error: true, raw: text.substring(0, 2000) }
      }
    }

    return { parse_error: true, raw: text.substring(0, 2000) }
  }
}

// ── Database writer ────────────────────────────────────────────────────────

async function writeExtractedData(data, documentId, clientId, docType) {
  if (!data || data.parse_error) return { skipped: true, reason: 'parse_error' }

  const results = {}

  try {
    if (docType === 'capital_call') {
      // Claude sometimes returns an enriched "other"-style format with alternative
      // field names. Normalise before writing so no valid capital call is dropped.
      const fund_name = data.fund_name || data.fund || data.partnership_name || null

      // Amount may be top-level or buried in a key_amounts array
      const amount = data.amount != null
        ? data.amount
        : Array.isArray(data.key_amounts)
          ? (data.key_amounts.find(k => /this call|current call|call amount|capital call #/i.test(k.label))?.amount
            ?? data.key_amounts.find(k => k.amount > 0 && !/commitment|remaining|prior/i.test(k.label))?.amount
            ?? null)
          : null

      // Due date may be top-level or in key_dates
      const due_date = data.due_date != null
        ? data.due_date
        : Array.isArray(data.key_dates)
          ? (data.key_dates.find(k => /due|payment/i.test(k.label))?.date ?? null)
          : null

      // Unfunded remaining
      const unfunded_remaining = data.unfunded_remaining != null
        ? data.unfunded_remaining
        : Array.isArray(data.key_amounts)
          ? (data.key_amounts.find(k => /unfunded|remaining after/i.test(k.label))?.amount ?? null)
          : null

      // Total commitment
      const total_commitment = data.total_commitment != null
        ? data.total_commitment
        : Array.isArray(data.key_amounts)
          ? (data.key_amounts.find(k => /total.*commit|lp.*commit/i.test(k.label))?.amount ?? null)
          : null

      if (fund_name && amount != null) {
        const { data: inserted, error } = await supabase
          .from('capital_calls')
          .upsert({
            client_id: clientId,
            document_id: documentId,
            fund_name,
            manager: data.manager || (Array.isArray(data.entities) ? data.entities[0] : null),
            amount,
            due_date,
            call_number: data.call_number || null,
            unfunded_remaining,
            status: 'pending',
          })
          .select()
          .single()

        if (error) throw error
        results.capital_call = inserted
      }
    }

    if (docType === 'alt_statement' || docType === 'performance') {
      // Primary fields (standard format)
      let fund_name = data.fund_name

      // Fallback: if Claude returned 'other'-style JSON, pull from entities array
      if (!fund_name && Array.isArray(data.entities) && data.entities.length > 0) {
        fund_name = data.entities[0]
      }

      // NAV: direct field → key_amounts → amount (capital_call format stores called capital)
      let nav = data.nav ?? null
      if (nav == null && Array.isArray(data.key_amounts)) {
        const navEntry = data.key_amounts.find(k => /net asset value|nav\b/i.test(k.label))
        nav = navEntry?.amount ?? null
      }
      if (nav == null && data.amount != null) nav = data.amount

      // IRR: direct field → performance_metrics (fraction → %) → notes string
      let irr = data.irr ?? null
      if (irr == null && data.performance_metrics?.net_irr_since_inception != null) {
        irr = Math.round(data.performance_metrics.net_irr_since_inception * 1000) / 10 // fraction → %
      }
      if (irr == null && typeof data.notes === 'string') {
        const m = data.notes.match(/Net\s+IRR\s+([\d.]+)%/i)
        if (m) irr = parseFloat(m[1])
      }

      // TVPI: direct field → performance_metrics → notes string
      let tvpi = data.tvpi ?? null
      if (tvpi == null) tvpi = data.performance_metrics?.equity_multiple_tvpi ?? null
      if (tvpi == null && typeof data.notes === 'string') {
        const m = data.notes.match(/Net\s+TVPI\s+([\d.]+)x/i)
        if (m) tvpi = parseFloat(m[1])
      }

      // DPI: direct field → performance_metrics
      let dpi = data.dpi ?? data.performance_metrics?.distributions_to_paid_in_dpi ?? null

      // Unfunded: direct fields
      let unfunded = data.unfunded_commitment ?? data.unfunded_remaining ?? null
      if (unfunded == null && Array.isArray(data.key_amounts)) {
        const u = data.key_amounts.find(k => /unfunded/i.test(k.label))
        unfunded = u?.amount ?? null
      }

      // Asset class: direct → account_details
      let asset_class = data.asset_class
        || data.account_details?.asset_class
        || 'Alternative'

      // As-of date: direct → account_details
      let as_of_date = data.as_of_date
        || data.account_details?.period_ending
        || data.account_details?.statement_date
        || null

      if (fund_name) {
        const { data: inserted, error } = await supabase
          .from('holdings')
          .upsert({
            client_id:    clientId,
            document_id:  documentId,
            fund_name,
            manager:      data.manager || null,
            asset_class,
            market_value: nav,
            irr,
            tvpi,
            dpi,
            unfunded,
            as_of_date,
          })
          .select()
          .single()

        if (error) throw error
        results.holding = inserted
      }
    }

    if (docType === 'statement') {
      // Claude sometimes returns { equities: [...], fixed_income: [...] } instead of a flat array.
      // Flatten whichever shape we receive before writing rows.
      let holdingsArr = null
      if (Array.isArray(data.holdings)) {
        holdingsArr = data.holdings
      } else if (data.holdings && typeof data.holdings === 'object') {
        holdingsArr = Object.values(data.holdings).flat()
      }

      if (holdingsArr?.length > 0) {
        const custodian = data.custodian || data.account_info?.custodian || null
        const asOfDate  = data.as_of_date || data.account_info?.statement_period_end || null

        const rows = holdingsArr
          .filter(h => h.name || h.security)
          .map(h => ({
            client_id:    clientId,
            document_id:  documentId,
            fund_name:    h.name || h.security,
            manager:      custodian,
            asset_class:  h.asset_class
              || (h.ticker     ? 'Equity'       : null)
              || (h.coupon != null ? 'Fixed Income' : null)
              || 'Unknown',
            market_value: h.market_value,
            as_of_date:   asOfDate,
          }))

        if (rows.length > 0) {
          const { data: inserted, error } = await supabase
            .from('holdings')
            .upsert(rows)
            .select()

          if (error) throw error
          results.holdings = inserted
        }
      }
    }

  } catch (e) {
    console.error('DB write error:', e)
    results.error = e.message
  }

  return results
}
