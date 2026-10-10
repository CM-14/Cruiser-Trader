import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { ArrowRight, BadgeCheck, Gavel, ReceiptText, Search, Wrench } from 'lucide-react'
import { SERIES, type SeriesId } from '@/data/fixtures'
import { allIn, img, money, seriesYears } from '@/lib/format'
import { useStore } from '@/lib/store'
import { ListingCard } from '@/components/ListingCard'
import { WantedRow } from '@/components/WantedRow'
import { TrailSection } from '@/components/TrailSection'
import { SeriesOptions, YearOptions } from '@/components/SeriesSelect'

export const Route = createFileRoute('/')({
  component: Home,
})

const FRESH = ['1993-fzj80-manual', '1966-fj45-troopy', 'fj40-steel-front-bumper', '2011-lc200', '80-front-axle-rebuild-kit', '1987-fj60-survivor']

const PILLARS = [
  { icon: ReceiptText, title: 'All-in pricing', body: 'Fees and shipping are in the number you see. No surprises at checkout.' },
  { icon: Wrench, title: 'Fitment by year', body: 'Save your rig once and every part shows whether it fits.' },
  { icon: Gavel, title: 'Soft-close auctions', body: 'A bid in the final two minutes adds two more. Nobody gets sniped.' },
  { icon: BadgeCheck, title: 'Verified Cruisers', body: 'Email, phone and photo ID confirmed before anyone can sell or bid.' },
]

function Home() {
  const { listings, wanted } = useStore()
  const navigate = useNavigate()
  const [series, setSeries] = useState<SeriesId | ''>('')
  const [year, setYear] = useState('')
  const [q, setQ] = useState('')
  const hero = listings.find((l) => l.id === '1978-fj40-frame-off')!

  const search = (e: FormEvent) => {
    e.preventDefault()
    navigate({ to: '/shop', search: { s: series || undefined, y: Number(year) || undefined, q: q.trim() || undefined } })
  }

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-svh items-center overflow-hidden bg-forest-deep pb-16 pt-28 text-cream">
        <div className="topo absolute inset-0" />
        <div className="absolute -right-40 -top-40 size-[640px] rounded-full bg-forest/60 blur-3xl" />
        <div className="container-x relative grid w-full items-center gap-12 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rise">
            <div className="eyebrow text-sand">For the enthusiast · 40 to 300 Series</div>
            <h1 className="display mt-5 text-[clamp(44px,7.4vw,96px)]">
              The marketplace<br />built for <span className="text-sand">Land&nbsp;Cruisers.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-[#cbc5b2]">
              Vehicles, parts and auctions, filtered by the series and year of your rig, from people who know the difference.
            </p>
            <form onSubmit={search} className="mt-9 grid max-w-2xl grid-cols-2 gap-2 rounded-2xl border border-cream/15 bg-cream/[.06] p-2 backdrop-blur-md sm:grid-cols-[1fr_1fr_1.5fr_auto]">
              <label className="sr-only" htmlFor="hs">Series</label>
              <select id="hs" value={series} onChange={(e) => { setSeries(Number(e.target.value) as SeriesId || ''); setYear('') }}
                className="h-12 min-w-0 rounded-xl border border-cream/10 bg-black/25 px-3 text-cream [&>option]:text-ink">
                <SeriesOptions any />
              </select>
              <label className="sr-only" htmlFor="hy">Year</label>
              <select id="hy" value={year} onChange={(e) => setYear(e.target.value)}
                className="h-12 min-w-0 rounded-xl border border-cream/10 bg-black/25 px-3 text-cream [&>option]:text-ink">
                <YearOptions series={series} any />
              </select>
              <label className="sr-only" htmlFor="hq">Keyword</label>
              <input id="hq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Part or vehicle, e.g. axle"
                className="col-span-2 h-12 min-w-0 rounded-xl border border-cream/10 bg-black/25 px-4 text-cream placeholder:text-[#a8a18d] sm:col-span-1" />
              <button className="btn btn-primary col-span-2 h-12 rounded-xl sm:col-span-1">
                <Search className="size-4" /> Search
              </button>
            </form>
          </div>

          <Link to="/listing/$id" params={{ id: hero.id }} className="group rise block [animation-delay:.15s]">
            <div className="relative aspect-[16/11] overflow-hidden rounded-3xl shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)] lg:aspect-[4/5]">
              <img
                src={img(hero.image, 900, 1125)}
                srcSet={`${img(hero.image, 600, 750)} 600w, ${img(hero.image, 900, 1125)} 900w`}
                sizes="(min-width: 1024px) 40vw, 100vw"
                alt={hero.title}
                fetchPriority="high"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-20">
                <div className="eyebrow text-[10px] text-sand">Featured · {hero.location}</div>
                <div className="mt-1 flex items-end justify-between gap-4">
                  <span className="text-lg font-semibold">{hero.title}</span>
                  <span className="display shrink-0 text-xl [font-stretch:112%]">{money(allIn(hero))}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Series index */}
      <section className="py-20 md:py-28">
        <div className="container-x">
          <SectionHead title="Browse by series" sub="Every generation, one index." />
          <div className="grid grid-cols-2 border-t border-ink sm:grid-cols-4 lg:grid-cols-8">
            {SERIES.map((s) => (
              <Link key={s.id} to="/vehicles" search={{ s: s.id }}
                className="group border-b border-r border-line px-4 pb-5 pt-6 transition-colors hover:bg-forest hover:text-cream">
                <b className="display block text-[clamp(32px,3.6vw,48px)]">{s.id}</b>
                <small className="mt-2 block font-mono text-[11px] text-mute group-hover:text-sand">{seriesYears(s.id)}</small>
                <small className="block text-[12px] text-mute group-hover:text-cream/80">{s.nickname}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TrailSection />

      {/* Fresh listings */}
      <section className="py-20 md:py-28">
        <div className="container-x">
          <SectionHead title="Fresh on the lot" action={<Link to="/shop" className="btn btn-outline">View all listings <ArrowRight className="size-4" /></Link>} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FRESH.map((id) => listings.find((l) => l.id === id)).filter((l) => !!l).map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-y border-line bg-card py-20">
        <div className="container-x grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <div className="grid size-11 place-items-center rounded-full bg-forest text-cream"><Icon className="size-5" /></div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-mute">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wanted */}
      <section className="py-20 md:py-28">
        <div className="container-x">
          <SectionHead title="Wanted" sub="Buyers post what they're hunting for. Got it? Answer directly."
            action={<Link to="/wanted" className="btn btn-outline">All posts <ArrowRight className="size-4" /></Link>} />
          {wanted.slice(0, 3).map((w) => <WantedRow key={w.id} w={w} />)}
        </div>
      </section>

      {/* Sell band */}
      <section className="relative overflow-hidden bg-forest text-cream">
        <img src={img('sell', 1600, 900)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/85 to-transparent" />
        <div className="container-x relative py-24 md:py-32">
          <div className="max-w-xl">
            <h2 className="display text-[clamp(32px,4.6vw,58px)]">Got a cruiser or parts to sell?</h2>
            <p className="mt-5 text-lg text-[#d3dbd2]">List in minutes. Fees are built into the buyer's price, so you keep exactly what you ask.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/sell" className="btn btn-primary">Start selling <ArrowRight className="size-4" /></Link>
              <Link to="/verified" className="btn border border-cream/30 hover:border-cream">Get verified</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function SectionHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h2 className="display text-[clamp(32px,4.6vw,58px)]">{title}</h2>
        {sub && <p className="mt-3 max-w-md text-mute">{sub}</p>}
      </div>
      {action}
    </div>
  )
}
