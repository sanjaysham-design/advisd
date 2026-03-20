import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { question, clientContext } = req.body

  if (!question || !clientContext) {
    return res.status(400).json({ error: 'question and clientContext are required' })
  }

  try {
    let context = { ...clientContext }

    // If clientId is present, fetch live data from Supabase and merge
    if (clientContext.clientId) {
      const [{ data: liveCapitalCalls }, { data: liveHoldings }] = await Promise.all([
        supabase
          .from('capital_calls')
          .select('*')
          .eq('client_id', clientContext.clientId)
          .order('due_date', { ascending: true }),
        supabase
          .from('holdings')
          .select('*')
          .eq('client_id', clientContext.clientId)
          .order('market_value', { ascending: false }),
      ])

      if (liveCapitalCalls?.length) context.liveCapitalCalls = liveCapitalCalls
      if (liveHoldings?.length)     context.liveHoldings    = liveHoldings
    }

    const contextStr = buildContextString(context)

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: `You are an AI assistant for a family office portfolio management platform called Advisd.
Answer the advisor's question based only on the provided portfolio data.
Return ONLY valid JSON with this exact structure — no markdown, no explanation:
{
  "title": "short answer title (5-8 words)",
  "body": "1-3 sentence answer with key numbers highlighted using <strong> tags",
  "rows": { "headers": ["Col1", "Col2"], "data": [["val1", "val2"]] } or null if no table needed,
  "footer": "data source note or caveat, or null"
}`,
      messages: [
        {
          role: 'user',
          content: `Portfolio data:\n${contextStr}\n\nQuestion: ${question}`,
        },
      ],
    })

    const raw     = message.content[0].text
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const result = JSON.parse(cleaned)
      return res.status(200).json(result)
    } catch {
      // If JSON parse fails, return a graceful fallback
      return res.status(200).json({
        title: 'Answer',
        body: raw.substring(0, 500),
        rows: null,
        footer: null,
      })
    }

  } catch (error) {
    console.error('Query error:', error)
    return res.status(500).json({
      title: 'Unable to answer',
      body: `Sorry, I encountered an error processing your question. Please try again.`,
      rows: null,
      footer: null,
    })
  }
}

// ── Context builder ─────────────────────────────────────────────────────────

function buildContextString(ctx) {
  const fmt    = n  => n != null ? `$${(n / 1_000_000).toFixed(2)}M` : 'N/A'
  const fmtK   = n  => n != null ? `$${(n / 1_000).toFixed(0)}K`     : 'N/A'
  const fmtPct = n  => n != null ? `${n}%`                            : 'N/A'

  const lines = []

  lines.push(`CLIENT: ${ctx.name}`)
  lines.push(`AUM: ${fmt(ctx.aum)} | YTD Gain: ${fmt(ctx.ytdGain)} (${fmtPct(ctx.ytdPct)})`)
  lines.push(`IRR: ${fmtPct(ctx.irr)} | TWRR: ${fmtPct(ctx.twrr)} | Inception: ${ctx.inception}`)

  if (ctx.allocation?.length) {
    lines.push(`\nALLOCATION:`)
    ctx.allocation.forEach(a => lines.push(`  ${a.name}: ${a.pct}%`))
  }

  // Prefer live Supabase holdings; only fall back to mock if no live records exist
  if (ctx.liveHoldings?.length) {
    lines.push(`\nHOLDINGS (live):`)
    ctx.liveHoldings.slice(0, 10).forEach(h => {
      lines.push(`  ${h.fund_name} | ${h.asset_class} | NAV: ${fmt(h.market_value)} | IRR: ${fmtPct(h.irr)} | TVPI: ${h.tvpi != null ? h.tvpi + 'x' : 'N/A'} | As of: ${h.as_of_date ?? 'N/A'}`)
    })
  } else if (ctx.holdings?.length) {
    lines.push(`\nHOLDINGS (top ${Math.min(ctx.holdings.length, 10)}):`)
    ctx.holdings.slice(0, 10).forEach(h => {
      lines.push(`  ${h.name} | ${h.type} | Value: ${fmt(h.value)} | Return: ${fmtPct(h.ret)} (${h.retLabel ?? ''}) | TVPI: ${h.tvpi != null ? h.tvpi + 'x' : 'N/A'} | Vintage: ${h.vintage ?? 'N/A'}`)
    })
  }

  // Prefer live Supabase data; only fall back to mock if no live records exist
  if (ctx.liveCapitalCalls?.length) {
    lines.push(`\nUPCOMING CAPITAL CALLS (live):`)
    ctx.liveCapitalCalls.forEach(c => {
      lines.push(`  ${c.fund_name}: ${fmtK(c.amount)} due ${c.due_date ?? 'N/A'} | Status: ${c.status} | Unfunded remaining: ${fmt(c.unfunded_remaining)}`)
    })
  } else if (ctx.upcomingCalls?.length) {
    lines.push(`\nUPCOMING CAPITAL CALLS:`)
    ctx.upcomingCalls.forEach(c => {
      lines.push(`  ${c.fund}: ${fmtK(c.amount)} due ${c.due}`)
    })
  }

  if (ctx.recentDistributions?.length) {
    lines.push(`\nRECENT DISTRIBUTIONS (last 5):`)
    ctx.recentDistributions.slice(0, 5).forEach(d => {
      lines.push(`  ${d.fund}: ${fmtK(d.amount)} on ${d.date}`)
    })
  }

  return lines.join('\n')
}
