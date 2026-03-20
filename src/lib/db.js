import { supabase } from './supabase'

// ── Clients ────────────────────────────────────────────────────────────────

export async function fetchClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

// ── Documents ──────────────────────────────────────────────────────────────

export async function fetchDocuments(clientId) {
  let query = supabase
    .from('documents')
    .select('*')
    .order('uploaded_at', { ascending: false })

  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function uploadDocument(file, clientId, docType) {
  // 1. Upload file to Supabase Storage
  const filePath = `${clientId}/${Date.now()}_${file.name}`
  const { error: storageError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (storageError) throw storageError

  // 2. Insert record into documents table
  const { data, error: dbError } = await supabase
    .from('documents')
    .insert({
      client_id: clientId,
      file_name: file.name,
      file_path: filePath,
      doc_type: docType,
      processed: false,
    })
    .select()
    .single()

  if (dbError) throw dbError
  return data
}

export async function deleteDocument(docId, filePath) {
  // Remove FK children first (capital_calls and holdings reference document_id)
  await supabase.from('capital_calls').delete().eq('document_id', docId)
  await supabase.from('holdings').delete().eq('document_id', docId)

  // Delete from storage
  await supabase.storage.from('documents').remove([filePath])

  // Delete document row
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId)

  if (error) throw error
}

export async function updateDocumentType(docId, docType) {
  const { error } = await supabase
    .from('documents')
    .update({ doc_type: docType })
    .eq('id', docId)
  if (error) throw error
}

export async function getDocumentUrl(filePath) {
  const { data } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 60 * 60) // 1 hour expiry
  return data?.signedUrl
}

// ── Capital Calls ──────────────────────────────────────────────────────────

export async function fetchCapitalCalls(clientId) {
  let query = supabase
    .from('capital_calls')
    .select('*, documents(file_name)')
    .order('due_date', { ascending: true })

  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function upsertCapitalCall(call) {
  const { data, error } = await supabase
    .from('capital_calls')
    .upsert(call)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Holdings ───────────────────────────────────────────────────────────────

export async function fetchHoldings(clientId) {
  let query = supabase
    .from('holdings')
    .select('*, documents(file_name)')
    .order('market_value', { ascending: false })

  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function upsertHolding(holding) {
  const { data, error } = await supabase
    .from('holdings')
    .upsert(holding)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Mark document as processed ─────────────────────────────────────────────

export async function markDocumentProcessed(docId, rawText) {
  const { error } = await supabase
    .from('documents')
    .update({ processed: true, raw_text: rawText })
    .eq('id', docId)
  if (error) throw error
}
