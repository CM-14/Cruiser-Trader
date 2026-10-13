/**
 * Small client for Supabase Auth and the `profiles` table, using plain `fetch`.
 * It needs no extra package. When live chat and photo upload arrive, this can be
 * swapped for the official `@supabase/supabase-js` library.
 *
 * Only the project URL and the publishable key belong here. Never the secret key.
 */

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
const STORE = 'ct-session'

export interface AuthUser {
  id: string
  email?: string
}

export interface Session {
  access_token: string
  refresh_token: string
  /** Seconds since 1970. */
  expires_at: number
  user: AuthUser
}

export const configured = () => Boolean(URL_ && KEY)

function load(): Session | null {
  try {
    const raw = localStorage.getItem(STORE)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function save(s: Session | null) {
  try {
    s ? localStorage.setItem(STORE, JSON.stringify(s)) : localStorage.removeItem(STORE)
  } catch {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any

async function call(path: string, init: RequestInit & { token?: string } = {}) {
  const { token, headers, ...rest } = init
  const res = await fetch(`${URL_}${path}`, {
    ...rest,
    headers: {
      apikey: KEY as string,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  })
  const text = await res.text()
  let body: Json = null
  try { body = text ? JSON.parse(text) : null } catch { body = null }
  return { ok: res.ok, body }
}

const errMsg = (b: Json, fallback: string): string =>
  (b && (b.msg || b.error_description || b.message || b.error)) || fallback

function toSession(b: Json): Session {
  return {
    access_token: b.access_token,
    refresh_token: b.refresh_token,
    expires_at: b.expires_at ?? Math.floor(Date.now() / 1000) + (b.expires_in ?? 3600),
    user: { id: b.user.id, email: b.user.email },
  }
}

/** The saved session, refreshed first if it is about to expire. */
async function freshSession(): Promise<Session | null> {
  const s = load()
  if (!s) return null
  if (s.expires_at - Date.now() / 1000 > 60) return s
  const r = await call('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: s.refresh_token }),
  })
  if (!r.ok || !r.body?.access_token) {
    save(null)
    return null
  }
  const next = toSession(r.body)
  save(next)
  return next
}

export const auth = {
  /** Restore the saved session, or finish sign-in when the page was opened from a confirmation email link. */
  async restore(): Promise<Session | null> {
    const hash = window.location.hash
    if (hash.includes('access_token=')) {
      const p = new URLSearchParams(hash.slice(1))
      const access = p.get('access_token')
      const refresh = p.get('refresh_token')
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      if (access && refresh) {
        const r = await call('/auth/v1/user', { token: access })
        if (r.ok && r.body?.id) {
          const s: Session = {
            access_token: access,
            refresh_token: refresh,
            expires_at: Math.floor(Date.now() / 1000) + Number(p.get('expires_in') ?? 3600),
            user: { id: r.body.id, email: r.body.email },
          }
          save(s)
          return s
        }
      }
    }
    return freshSession()
  },

  async signUp(email: string, password: string, displayName: string, redirectTo: string): Promise<{ session?: Session; error?: string }> {
    const r = await call(`/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: 'POST',
      body: JSON.stringify({ email, password, data: displayName ? { display_name: displayName } : {} }),
    })
    if (!r.ok) return { error: errMsg(r.body, 'Could not create the account.') }
    if (r.body?.access_token) {
      const s = toSession(r.body)
      save(s)
      return { session: s }
    }
    return {}
  },

  async signIn(email: string, password: string): Promise<{ session?: Session; error?: string }> {
    const r = await call('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (!r.ok || !r.body?.access_token) return { error: errMsg(r.body, 'Could not sign in.') }
    const s = toSession(r.body)
    save(s)
    return { session: s }
  },

  async signOut(): Promise<void> {
    const s = load()
    save(null)
    if (s) {
      try { await call('/auth/v1/logout', { method: 'POST', token: s.access_token }) } catch {}
    }
  },
}

export async function fetchProfile<T>(id: string): Promise<T | null> {
  const s = await freshSession()
  if (!s) return null
  const r = await call(`/rest/v1/profiles?id=eq.${encodeURIComponent(id)}&select=*`, { token: s.access_token })
  return r.ok && Array.isArray(r.body) ? ((r.body[0] as T | undefined) ?? null) : null
}

export async function patchProfile<T>(id: string, patch: Record<string, unknown>): Promise<{ profile?: T; error?: string }> {
  const s = await freshSession()
  if (!s) return { error: 'Please sign in again.' }
  const r = await call(`/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    token: s.access_token,
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  })
  if (!r.ok) return { error: r.body?.code === '23505' ? 'That username is already taken.' : errMsg(r.body, 'Could not save your profile.') }
  const row = Array.isArray(r.body) ? r.body[0] : null
  return row ? { profile: row as T } : { error: 'Could not save your profile.' }
}
