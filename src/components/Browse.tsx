import { Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Check, SlidersHorizontal } from 'lucide-react'
import type { Delivery, ListingType, SeriesId } from '@/data/fixtures'
import { allIn, cx, fits, matchesYear, money } from '@/lib/format'
import { useStore } from '@/lib/store'
import type { BrowseSearch } from '@/lib/search'
import { ListingCard } from './ListingCard'
import { PageHeader } from './PageHeader'
import { SeriesOptions, YearOptions } from './SeriesSelect'

const COPY: Record<ListingType | 'All', [string, string]> = {
  Vehicle: ['Vehicles', 'Documented Land Cruisers, from FJ40s to the 300 Series.'],
  Parts: ['Parts', 'Filter by series and model year to see only parts that fit.'],
  Auction: ['Auctions', 'Timed auctions with soft close. Late bids extend the clock.'],
  All: ['All listings', 'Vehicles, parts and auctions in one place.'],
}

type Sort = 'featured' | 'low' | 'high'
export type BrowsePath = '/vehicles' | '/parts' | '/auctions' | '/shop'

/** Filterable listing grid. Series, year and keyword are mirrored in the URL; the rest is local. */
export function Browse({ type, path, search }: { type?: ListingType; path: BrowsePath; search: BrowseSearch }) {
  const { listings, rig, toast } = useStore()
  const navigate = useNavigate()
  const [delivery, setDelivery] = useState<Delivery | ''>('')
  const [max, setMax] = useState(0)
  const [sort, setSort] = useState<Sort>('featured')
  const [fitOnly, setFitOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { s = '', y, q = '' } = search

  const setSearch = (patch: Partial<BrowseSearch>) =>
    navigate({ to: path, search: { ...search, ...patch }, replace: true, resetScroll: false })

  const results = useMemo(() => {
    const kw = q.toLowerCase()
    const out = listings.filter((l) =>
      (!type || l.type === type) &&
      (!s || l.series === s) &&
      (!y || matchesYear(l, y)) &&
      (!delivery || l.delivery === delivery) &&
      (!max || allIn(l) <= max) &&
      (!fitOnly || fits(l, rig)) &&
      (!kw || `${l.title} ${l.category ?? ''}`.toLowerCase().includes(kw)))
    if (sort === 'low') out.sort((a, b) => allIn(a) - allIn(b))
    if (sort === 'high') out.sort((a, b) => allIn(b) - allIn(a))
    return out
  }, [listings, type, s, y, q, delivery, max, fitOnly, rig, sort])

  const reset = () => {
    setDelivery(''); setMax(0); setFitOnly(false); setSort('featured')
    navigate({ to: path, search: {}, replace: true, resetScroll: false })
  }

  const toggleFit = () => {
    if (!rig) {
      toast('Save your rig in the garage first')
      return navigate({ to: '/garage' })
    }
    setFitOnly((f) => !f)
  }

  const [title, sub] = COPY[type ?? 'All']

  return (
    <>
      <PageHeader title={title} sub={sub} />
      <div className="container-x grid items-start gap-8 pb-24 pt-10 lg:grid-cols-[272px_1fr]">
        <aside className={cx('panel p-5 lg:sticky lg:top-24', !filtersOpen && 'hidden lg:block')} aria-label="Filters">
          <div className="space-y-4">
            <label className="field-label">Search
              <input className="field" value={q} onChange={(e) => setSearch({ q: e.target.value || undefined })} placeholder="e.g. axle" />
            </label>
            <label className="field-label">Series
              <select className="field" value={s} onChange={(e) => setSearch({ s: (Number(e.target.value) || undefined) as SeriesId | undefined, y: undefined })}>
                <SeriesOptions any />
              </select>
            </label>
            <label className="field-label">Model year
              <select className="field" value={y ?? ''} disabled={!s} onChange={(e) => setSearch({ y: Number(e.target.value) || undefined })}>
                <YearOptions series={s} any />
              </select>
            </label>
            <label className="field-label">Delivery
              <select className="field" value={delivery} onChange={(e) => setDelivery(e.target.value as Delivery | '')}>
                <option value="">Any</option><option>Ships</option><option>Local pickup</option>
              </select>
            </label>
            <label className="field-label">Max all-in price
              <select className="field" value={max} onChange={(e) => setMax(Number(e.target.value))}>
                <option value={0}>No max</option>
                {[500, 2500, 10000, 25000, 50000].map((n) => <option key={n} value={n}>{money(n)}</option>)}
              </select>
            </label>
            <button onClick={toggleFit} aria-pressed={fitOnly}
              className={cx('btn btn-block', fitOnly ? 'bg-forest text-cream' : 'btn-outline')}>
              {fitOnly && <Check className="size-4" />} Fits my garage
            </button>
            <button onClick={reset} className="w-full text-sm font-medium text-mute hover:text-rust">Reset filters</button>
          </div>
        </aside>

        <div>
          <div className="mb-6 flex items-center gap-3">
            <button className="btn btn-outline btn-sm lg:hidden" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
              <SlidersHorizontal className="size-4" /> Filters
            </button>
            <span className="font-mono text-xs text-mute">{results.length} {results.length === 1 ? 'LISTING' : 'LISTINGS'}</span>
            <select className="field ml-auto mt-0 h-10 w-auto text-sm" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
              <option value="featured">Sort: featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
          {results.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((l) => <ListingCard key={l.id} l={l} />)}
            </div>
          ) : (
            <div className="panel grid place-items-center px-6 py-20 text-center">
              <p className="text-lg font-semibold">No listings match.</p>
              <p className="mt-1 text-mute">Try widening the filters, or let sellers come to you.</p>
              <Link to="/wanted" className="btn btn-primary mt-6">Post a wanted ad</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
