import { SERIES, type ListingType, type SeriesId } from '@/data/fixtures'

export interface BrowseSearch {
  s?: SeriesId
  y?: number
  q?: string
}

/** Shared `validateSearch` for every browse route. Unknown or invalid values are dropped. */
export function browseSearch(raw: Record<string, unknown>): BrowseSearch {
  const out: BrowseSearch = {}
  const s = Number(raw.s)
  if (SERIES.some((x) => x.id === s)) out.s = s as SeriesId
  const y = Number(raw.y)
  if (y >= 1950 && y <= 2030) out.y = y
  // Search params are JSON-parsed, so a numeric keyword like "40" arrives as a number.
  if ((typeof raw.q === 'string' || typeof raw.q === 'number') && String(raw.q)) out.q = String(raw.q)
  return out
}

export function sellSearch(raw: Record<string, unknown>): { t?: ListingType } {
  return raw.t === 'Vehicle' || raw.t === 'Parts' || raw.t === 'Auction' ? { t: raw.t } : {}
}

export function messagesSearch(raw: Record<string, unknown>): { t?: string } {
  return typeof raw.t === 'string' ? { t: raw.t } : {}
}
