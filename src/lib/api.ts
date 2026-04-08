const TOKEN_KEY = 'sms_token'

function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL?.trim()
  if (base) {
    const origin = base.replace(/\/$/, '')
    return `${origin}/api${path}`
  }
  return `/api${path}`
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

type FetchOpts = RequestInit & { json?: unknown }

export async function api<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { json, headers: hdrs, ...rest } = opts
  const headers = new Headers(hdrs)
  if (json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  // Avoid 304 + empty body: fetch treats 304 as !res.ok and Express may respond with ETag revalidation.
  const res = await fetch(apiUrl(path), {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = typeof data.error === 'string' ? data.error : res.statusText
    throw new Error(msg || 'Request failed')
  }
  return data as T
}
