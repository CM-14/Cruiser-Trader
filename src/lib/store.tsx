import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  LISTINGS, SELLERS, SOFT_CLOSE_MS, THREADS, WANTED,
  type Listing, type Thread, type WantedPost,
} from '@/data/fixtures'
import type { Rig } from './format'
import { getSupabase } from './supabase'

/**
 * Client-side marketplace state. Everything lives in memory (the saved rig and
 * verification flag persist to localStorage) until real persistence lands —
 * see PLAN.md.
 */

export interface LiveListing extends Listing {
  /** Absolute auction end timestamp. */
  endsAt?: number
}

/** A row of the `profiles` table in Supabase. */
export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  city: string | null
  state: string | null
  email_verified: boolean
  phone_verified: boolean
  id_verified: boolean
  vehicle_seller_verified: boolean
  role: 'user' | 'moderator' | 'admin'
  /** 0 browse only, 1 email + phone, 2 ID verified, 3 verified vehicle seller. */
  trust_level: number
}

/** The only profile fields a member may edit. Verification flags are protected in the database. */
export type ProfileEdit = Partial<Pick<Profile, 'display_name' | 'username' | 'city' | 'state' | 'bio'>>

export interface AuthResult {
  error?: string
  /** True when Supabase sent a confirmation email and the member must click it before signing in. */
  needsConfirm?: boolean
}

interface Store {
  listings: LiveListing[]
  wanted: WantedPost[]
  threads: Thread[]
  rig: Rig | null
  user: User | null
  profile: Profile | null
  /** False until the saved session (if any) has been checked. */
  authReady: boolean
  /**
   * Temporary gate for bidding, selling and messaging: true when signed in.
   * A later milestone replaces this with the real trust levels in `profile.trust_level`.
   */
  verified: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  updateProfile: (patch: ProfileEdit) => Promise<{ error?: string }>
  saveRig: (r: Rig | null) => void
  addListing: (l: LiveListing) => void
  placeBid: (id: string, amount: number) => { extended: boolean }
  setEnd: (id: string, endsAt: number) => void
  addWanted: (w: WantedPost) => void
  openThread: (withName: string, subject: string) => string
  sendMessage: (threadId: string, text: string) => void
  toast: (msg: string) => void
  verifyOpen: boolean
  setVerifyOpen: (o: boolean) => void
}

const Ctx = createContext<Store | null>(null)
const RIG_KEY = 'ct-rig'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<LiveListing[]>(() => {
    const t = Date.now()
    return LISTINGS.map((l) => ({ ...l, bids: l.bids ? [...l.bids] : undefined, endsAt: l.endsIn ? t + l.endsIn : undefined }))
  })
  const [wanted, setWanted] = useState(WANTED)
  const [threads, setThreads] = useState<Thread[]>(() => THREADS.map((t) => ({ ...t, messages: [...t.messages] })))
  const [rig, setRig] = useState<Rig | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<{ text: string; key: number } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    try {
      const r = localStorage.getItem(RIG_KEY)
      if (r) setRig(JSON.parse(r))
    } catch {}
  }, [])

  const toast = useCallback((text: string) => {
    clearTimeout(toastTimer.current)
    setToastMsg({ text, key: Date.now() })
    toastTimer.current = setTimeout(() => setToastMsg(null), 2800)
  }, [])

  const saveRig = useCallback((r: Rig | null) => {
    setRig(r)
    try {
      r ? localStorage.setItem(RIG_KEY, JSON.stringify(r)) : localStorage.removeItem(RIG_KEY)
    } catch {}
  }, [])

  // Restore the saved Supabase session, and follow sign-in / sign-out / email-confirmation events.
  useEffect(() => {
    const sb = getSupabase()
    if (!sb) {
      setAuthReady(true)
      return
    }
    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthReady(true)
    })
    const { data } = sb.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  // Load the member's profile row whenever the signed-in user changes.
  const userId = user?.id
  useEffect(() => {
    const sb = getSupabase()
    if (!sb || !userId) {
      setProfile(null)
      return
    }
    let cancelled = false
    sb.from('profiles').select('*').eq('id', userId).maybeSingle().then(({ data }) => {
      if (!cancelled) setProfile((data as Profile | null) ?? null)
    })
    return () => { cancelled = true }
  }, [userId])

  const signUp = useCallback(async (email: string, password: string, displayName: string): Promise<AuthResult> => {
    const sb = getSupabase()
    if (!sb) return { error: 'Sign-in is not set up yet. The two Supabase settings are missing.' }
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: displayName ? { display_name: displayName } : undefined,
        emailRedirectTo: `${window.location.origin}/account`,
      },
    })
    if (error) return { error: error.message }
    return { needsConfirm: !data.session }
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const sb = getSupabase()
    if (!sb) return { error: 'Sign-in is not set up yet. The two Supabase settings are missing.' }
    const { error } = await sb.auth.signInWithPassword({ email, password })
    return error ? { error: error.message } : {}
  }, [])

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut()
    setProfile(null)
  }, [])

  const updateProfile = useCallback(async (patch: ProfileEdit): Promise<{ error?: string }> => {
    const sb = getSupabase()
    if (!sb || !userId) return { error: 'Sign in first.' }
    const { data, error } = await sb.from('profiles').update(patch).eq('id', userId).select().single()
    if (error) return { error: error.code === '23505' ? 'That username is already taken.' : error.message }
    setProfile(data as Profile)
    return {}
  }, [userId])

  const listingsRef = useRef(listings)
  listingsRef.current = listings

  const placeBid = useCallback((id: string, amount: number) => {
    const current = listingsRef.current.find((l) => l.id === id)
    const extended = !!current?.endsAt && current.endsAt - Date.now() < SOFT_CLOSE_MS
    const endsAt = extended ? Date.now() + SOFT_CLOSE_MS : current?.endsAt
    setListings((ls) => ls.map((l) =>
      l.id === id ? { ...l, price: amount, endsAt, bids: [...(l.bids ?? []), { bidder: 'you', amount }] } : l))
    return { extended }
  }, [])

  const setEnd = useCallback((id: string, endsAt: number) => {
    setListings((ls) => ls.map((l) => (l.id === id ? { ...l, endsAt } : l)))
  }, [])

  const addListing = useCallback((l: LiveListing) => setListings((ls) => [l, ...ls]), [])
  const addWanted = useCallback((w: WantedPost) => setWanted((ws) => [w, ...ws]), [])

  const threadsRef = useRef(threads)
  threadsRef.current = threads

  const openThread = useCallback((withName: string, subject: string) => {
    const found = threadsRef.current.find((t) => t.with === withName && t.subject === subject)
    if (found) return found.id
    const id = 't' + Date.now()
    setThreads((ts) => [{ id, with: withName, subject, messages: [] }, ...ts])
    return id
  }, [])

  const sendMessage = useCallback((threadId: string, text: string) => {
    const push = (fromMe: boolean, t: string) =>
      setThreads((ts) => ts.map((th) => (th.id === threadId ? { ...th, messages: [...th.messages, { fromMe, text: t }] } : th)))
    push(true, text)
    setTimeout(() => push(false, 'Thanks for reaching out. Still available, and happy to answer any questions.'), 1400)
  }, [])

  const value = useMemo<Store>(() => ({
    listings, wanted, threads, rig, user, profile, authReady, verified: !!user, signUp, signIn, signOut, updateProfile,
    saveRig, addListing, placeBid, setEnd, addWanted, openThread, sendMessage, toast, verifyOpen, setVerifyOpen,
  }), [listings, wanted, threads, rig, user, profile, authReady, signUp, signIn, signOut, updateProfile,
    saveRig, addListing, placeBid, setEnd, addWanted, openThread, sendMessage, toast, verifyOpen])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4"
      >
        {toastMsg && (
          <div key={toastMsg.key} className="toast-in rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper shadow-xl">
            {toastMsg.text}
          </div>
        )}
      </div>
    </Ctx.Provider>
  )
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside StoreProvider')
  return s
}

export const sellerById = (id: string) => SELLERS.find((s) => s.id === id) ?? SELLERS[SELLERS.length - 1]

/** Ticking clock for countdowns. Returns null during SSR so markup hydrates cleanly. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}
