import { FEE_RATE, SERIES, type Listing, type SeriesId } from '@/data/fixtures'

export const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

export const fee = (l: Listing) => Math.round(l.price * FEE_RATE)
export const allIn = (l: Listing) => l.price + (l.shipping ?? 0) + fee(l)

export const seriesById = (id: SeriesId | number) => SERIES.find((s) => s.id === Number(id))!

export const seriesYears = (id: SeriesId | number) => {
  const s = seriesById(id)
  return `${s.from}–${s.to >= 2026 ? 'now' : s.to}`
}

/** Years for a series, newest first. */
export const yearsFor = (id: SeriesId | number | '') => {
  if (!id) return []
  const s = seriesById(id)
  const out: number[] = []
  for (let y = Math.min(s.to, 2026); y >= s.from; y--) out.push(y)
  return out
}

export const typeLabel = (l: Listing) => (l.type === 'Parts' ? 'Part' : l.type)

/** Secondary spec line shown on cards: mileage, fitment or bid count. */
export const specLine = (l: Listing) => {
  if (l.type === 'Parts' && Array.isArray(l.year)) return `Fits ${l.year[0]}–${l.year[1]}`
  if (l.type === 'Auction') return `${l.bids?.length ?? 0} bids`
  return l.mileage ?? 'Mileage not listed'
}

export interface Rig {
  series: SeriesId
  year: number
  trim: string
  mods?: string
  vin?: string
}

export const fits = (l: Listing, rig: Rig | null) => {
  if (!rig || l.series !== rig.series) return false
  return Array.isArray(l.year) ? rig.year >= l.year[0] && rig.year <= l.year[1] : true
}

export const matchesYear = (l: Listing, y: number) =>
  Array.isArray(l.year) ? y >= l.year[0] && y <= l.year[1] : l.year === y

export function countdown(end: number, now: number) {
  const s = Math.max(0, Math.floor((end - now) / 1000))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  if (s === 0) return 'Ended'
  return d ? `${d}d ${h}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(s % 60)}`
}

/** Image URL routed through Netlify Image CDN. Uploaded data URLs pass straight through. */
export function img(key: string | undefined, w: number, h?: number) {
  if (!key) return undefined
  if (key.startsWith('data:') || key.startsWith('blob:')) return key
  const src = key.startsWith('/') ? key : `/img/${key}.jpg`
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}${h ? `&h=${h}&fit=cover` : ''}&fm=webp&q=78`
}

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
