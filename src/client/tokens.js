// Client portal token → client name mapping
// Tokens are used as lightweight URL auth: /?token=xxxx
// In production, replace with proper JWT/session auth

export const CLIENT_TOKENS = {
  'chen-portal-f8k2x9':       'Chen Family Office',
  'meridian-portal-7g2pqr':   'Meridian Capital Partners',
  'okonkwo-portal-9brtmv':    'Okonkwo Family Trust',
  'parklee-portal-4mq1zs':    'Park & Lee Family Office',
  'rosenberg-portal-2vjhbn':  'Rosenberg Family Trust',
}

export function getClientByToken(token) {
  return CLIENT_TOKENS[token] ?? null
}

export function getTokenByClient(name) {
  const entry = Object.entries(CLIENT_TOKENS).find(([, n]) => n === name)
  return entry ? entry[0] : null
}
