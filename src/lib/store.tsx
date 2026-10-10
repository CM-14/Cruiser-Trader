import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  LISTINGS, SELLERS, SOFT_CLOSE_MS, THREADS, WANTED,
  type Listing, type Thread, type WantedPost,
} from '@/data/fixtures'
import type { Rig } from './format'

/**
 * Client-side marketplace state. Everything lives in memory (the saved rig and
 * verification flag persist to localStorage) until real persistence lands —
 * see PLAN.md.
 */

export interface LiveListing extends Listing {
  /** Absolute auction end timestamp. */
  endsAt?: number
}

interface Store {
  listings: LiveListing[]
  wanted: WantedPost[]
  threads: Thread[]
  rig: Rig | null
  verified: boolean
  saveRig: (r: Rig | null) => void
  verify: () => void
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
const VERIFIED_KEY = 'ct-verified'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<LiveListing[]>(() => {
    const t = Date.now()
    return LISTINGS.map((l) => ({ ...l, bids: l.bids ? [...l.bids] : undefined, endsAt: l.endsIn ? t + l.endsIn : undefined }))
  })
  const [wanted, setWanted] = useState(WANTED)
  const [threads, setThreads] = useState<Thread[]>(() => THREADS.map((t) => ({ ...t, messages: [...t.messages] })))
  const [rig, setRig] = useState<Rig | null>(null)
  const [verified, setVerified] = useState(false)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<{ text: string; key: number } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    try {
      const r = localStorage.getItem(RIG_KEY)
      if (r) setRig(JSON.parse(r))
      if (localStorage.getItem(VERIFIED_KEY) === '1') setVerified(true)
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

  const verify = useCallback(() => {
    setVerified(true)
    try { localStorage.setItem(VERIFIED_KEY, '1') } catch {}
  }, [])

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
    listings, wanted, threads, rig, verified, saveRig, verify, addListing, placeBid, setEnd,
    addWanted, openThread, sendMessage, toast, verifyOpen, setVerifyOpen,
  }), [listings, wanted, threads, rig, verified, saveRig, verify, addListing, placeBid, setEnd, addWanted, openThread, sendMessage, toast, verifyOpen])

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
