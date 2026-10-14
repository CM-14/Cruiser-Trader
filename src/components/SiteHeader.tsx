import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { BadgeCheck, Menu, MessageSquare, User, Warehouse, X } from 'lucide-react'
import { PART_CATEGORIES, SERIES } from '@/data/fixtures'
import { allIn, cx, img, money, seriesYears } from '@/lib/format'
import { useStore, type LiveListing } from '@/lib/store'
import type { AppPath } from '@/lib/paths'

type NavKey = 'vehicles' | 'parts' | 'auctions' | 'wanted' | 'sell'
const NAV: { key: NavKey; label: string; to: `/${NavKey}` }[] = [
  { key: 'vehicles', label: 'Vehicles', to: '/vehicles' },
  { key: 'parts', label: 'Parts', to: '/parts' },
  { key: 'auctions', label: 'Auctions', to: '/auctions' },
  { key: 'wanted', label: 'Wanted', to: '/wanted' },
  { key: 'sell', label: 'Sell', to: '/sell' },
]

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname })
  const { user, profile, signOut, setVerifyOpen, listings } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mega, setMega] = useState<NavKey | null>(null)
  const isHome = path === '/'
  const solid = !isHome || scrolled || mobileOpen || mega !== null

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMega(null)
  }, [path])

  const featured = (id: string) => listings.find((l) => l.id === id)

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        solid ? 'border-b border-line bg-paper/90 text-ink backdrop-blur-xl' : 'border-b border-transparent text-cream',
      )}
      onMouseLeave={() => setMega(null)}
    >
      <div className="container-x flex h-[72px] items-center gap-8">
        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Cruiser Trader home">
          <img src="/logo.png" alt="" width={40} height={40} className="size-10 rounded-full" />
          <span className="display text-[17px] tracking-[.02em]">CRUISER TRADER</span>
        </Link>

        <nav className="hidden h-full items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <div key={n.key} className="h-full" onMouseEnter={() => setMega(n.key)} onFocus={() => setMega(n.key)}>
              <Link
                to={n.to}
                className="relative flex h-full items-center px-3 text-[14px] font-medium opacity-85 transition-opacity hover:opacity-100"
                activeProps={{ className: 'opacity-100 after:absolute after:inset-x-3 after:bottom-5 after:h-0.5 after:bg-rust' }}
              >
                {n.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/garage" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium opacity-85 hover:opacity-100 md:flex">
            <Warehouse className="size-4" /> Garage
          </Link>
          <Link to="/messages" search={{}} className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium opacity-85 hover:opacity-100 md:flex">
            <MessageSquare className="size-4" /> Messages
          </Link>
          {user ? (
            <>
              <Link to="/account" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium opacity-85 hover:opacity-100 sm:flex">
                <User className="size-4" /> {profile?.display_name || 'Account'}
                {profile?.id_verified && <BadgeCheck className="size-4 text-sand" aria-label="ID verified" />}
              </Link>
              <button className="btn btn-primary btn-sm" onClick={() => void signOut()}>Sign out</button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setVerifyOpen(true)}>Sign in</button>
          )}
          <button
            className="grid size-10 place-items-center rounded-full border border-current/25 lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Desktop mega menu */}
      {mega && (
        <div className="absolute inset-x-0 top-full hidden border-b border-line bg-paper text-ink shadow-[0_30px_50px_-20px_rgba(0,0,0,.25)] lg:block">
          <div className="container-x grid grid-cols-[1.6fr_1fr_1fr] gap-12 py-8">
            {mega === 'vehicles' && <>
              <SeriesColumn to="/vehicles" />
              <MenuColumn title="Browse" links={[['All vehicles', '/vehicles'], ['Vehicle auctions', '/auctions'], ['Series guide', '/series-guide'], ['Wanted posts', '/wanted']]} />
              <Featured l={featured('1993-fzj80-manual')} />
            </>}
            {mega === 'parts' && <>
              <SeriesColumn to="/parts" />
              <div>
                <h5 className="eyebrow mb-3 text-mute">Categories</h5>
                {PART_CATEGORIES.map((c) => (
                  <Link key={c.q} to="/parts" search={{ q: c.q }} className="block py-1.5 text-[15px] hover:text-rust">{c.label}</Link>
                ))}
              </div>
              <Featured l={featured('80-front-axle-rebuild-kit')} />
            </>}
            {mega === 'auctions' && <>
              <MenuColumn title="Auctions" links={[['Live now', '/auctions'], ['How soft close works', '/help'], ['List an auction', '/sell']]} />
              <MenuColumn title="Bidding" links={[['Get verified to bid', '/verified'], ['Fees and all-in pricing', '/help']]} />
              <Featured l={featured('2011-lc200')} />
            </>}
            {mega === 'wanted' && <>
              <MenuColumn title="Wanted" links={[['Browse wanted posts', '/wanted'], ['Post a wanted ad', '/wanted']]} />
              <p className="col-span-2 max-w-md self-center text-mute">Post what you're hunting for and let sellers come to you. Every post is visible to the whole community.</p>
            </>}
            {mega === 'sell' && <>
              <div>
                <h5 className="eyebrow mb-3 text-mute">Sell</h5>
                {(['Vehicle', 'Parts', 'Auction'] as const).map((t) => (
                  <Link key={t} to="/sell" search={{ t }} className="block py-1.5 text-[15px] hover:text-rust">
                    List {t === 'Parts' ? 'a part' : t === 'Auction' ? 'an auction' : 'a vehicle'}
                  </Link>
                ))}
              </div>
              <MenuColumn title="Trust" links={[['My listings', '/my-listings'], ['Get verified', '/verified'], ['Seller help', '/help']]} />
              <p className="max-w-xs self-center text-sm text-mute">Fees are built into the buyer's all-in price, so you keep exactly what you ask.</p>
            </>}
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-line bg-paper px-5 pb-8 text-ink lg:hidden">
          {[...NAV.map((n) => [n.label, n.to] as const), ['My Garage', '/garage'] as const, ['Messages', '/messages'] as const, ['Account', '/account'] as const, ['Series guide', '/series-guide'] as const].map(([label, to]) => (
            <Link key={to} to={to} className="display block border-b border-line py-4 text-xl [font-stretch:112%]">{label}</Link>
          ))}
        </div>
      )}
    </header>
  )
}

function SeriesColumn({ to }: { to: '/vehicles' | '/parts' }) {
  return (
    <div>
      <h5 className="eyebrow mb-3 text-mute">Shop by series</h5>
      <div className="grid grid-cols-2 gap-x-8">
        {SERIES.map((s) => (
          <Link key={s.id} to={to} search={{ s: s.id }} className="group flex items-baseline justify-between border-b border-line/60 py-2">
            <span className="text-[15px] font-medium group-hover:text-rust">{s.id} Series</span>
            <span className="font-mono text-[11px] text-mute">{seriesYears(s.id)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function MenuColumn({ title, links }: { title: string; links: [string, AppPath][] }) {
  return (
    <div>
      <h5 className="eyebrow mb-3 text-mute">{title}</h5>
      {links.map(([label, to]) => (
        <Link key={label} to={to} className="block py-1.5 text-[15px] hover:text-rust">{label}</Link>
      ))}
    </div>
  )
}

function Featured({ l }: { l?: LiveListing }) {
  if (!l) return null
  return (
    <Link to="/listing/$id" params={{ id: l.id }} className="group block">
      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-forest">
        {l.image && <img src={img(l.image, 480, 300)} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />}
      </div>
      <p className="mt-3 text-[15px] font-semibold group-hover:text-rust">{l.title}</p>
      <p className="font-mono text-xs text-mute">{money(allIn(l))} all-in</p>
    </Link>
  )
}
