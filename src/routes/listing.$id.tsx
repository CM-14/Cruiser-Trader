import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { BadgeCheck, Check, ChevronDown, Clock, MapPin, MessageSquare, Truck, X } from 'lucide-react'
import { MIN_BID_STEP, SOFT_CLOSE_MS, type Listing } from '@/data/fixtures'
import { allIn, cx, fee, fits, money, specLine, typeLabel } from '@/lib/format'
import { sellerById, useNow, useStore, type LiveListing } from '@/lib/store'
import { PageHeader } from '@/components/PageHeader'
import { ListingPhoto } from '@/components/ListingPhoto'
import { ListingCard } from '@/components/ListingCard'
import { Countdown } from '@/components/Countdown'
import { Dialog } from '@/components/Dialog'

export const Route = createFileRoute('/listing/$id')({
  component: ListingPage,
})

const SECTION: Record<Listing['type'], ['/vehicles' | '/parts' | '/auctions', string]> = {
  Vehicle: ['/vehicles', 'Vehicles'],
  Parts: ['/parts', 'Parts'],
  Auction: ['/auctions', 'Auctions'],
}

function ListingPage() {
  const { id } = Route.useParams()
  const { listings, listingsReady, rig, openThread, toast } = useStore()
  const [shot, setShot] = useState(0)
  const navigate = useNavigate()
  const l = listings.find((x) => x.id === id)
  if (!l && !listingsReady) return <div className="container-x pb-24 pt-[120px] text-mute">Loading…</div>
  if (!l) return (
    <>
      <PageHeader title="Listing not found" sub="It may have sold, or the link took a wrong turn." />
      <div className="container-x py-12"><Link to="/shop" className="btn btn-primary">Browse all listings</Link></div>
    </>
  )

  const seller = sellerById(l.sellerId)
  const [sectionTo, sectionLabel] = SECTION[l.type]
  const more = listings.filter((x) => x.id !== l.id && x.series === l.series).slice(0, 3)
  const description = l.description ?? (l.type === 'Parts'
    ? `Used part in good condition, cleaned and photographed. Fitment confirmed by the seller for ${specLine(l).replace('Fits ', '')}.`
    : `Well-documented ${l.title}. Records available and inspection welcome by appointment. VIN and title details are shared with serious buyers.`)

  return (
    <div className="container-x pb-24 pt-[104px]">
      <nav className="font-mono text-xs text-mute" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-rust">Home</Link> / <Link to={sectionTo} className="hover:text-rust">{sectionLabel}</Link> / {l.title}
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
        <div>
          <div className="relative">
            <ListingPhoto l={{ ...l, image: l.images?.[shot] ?? l.image }} w={1200} h={900} eager className="aspect-[4/3] rounded-3xl" />
            <span className="eyebrow absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-[10px] text-cream backdrop-blur">{typeLabel(l)}</span>
          </div>
          {l.images && l.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {l.images.map((src, i) => (
                <button key={src} onClick={() => setShot(i)} aria-label={`Photo ${i + 1}`}
                  className={cx('size-16 shrink-0 overflow-hidden rounded-lg border-2', i === shot ? 'border-rust' : 'border-transparent')}>
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="panel mt-6 p-6">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 text-[15.5px] leading-relaxed text-ink/85">{description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm sm:grid-cols-4">
              <Spec k="Series" v={`${l.series} Series`} />
              <Spec k={l.type === 'Parts' ? 'Fitment' : 'Year'} v={Array.isArray(l.year) ? `${l.year[0]}–${l.year[1]}` : String(l.year)} />
              <Spec k={l.type === 'Vehicle' ? 'Mileage' : l.type === 'Auction' ? 'Bids' : 'Shipping'} v={l.type === 'Parts' ? money(l.shipping ?? 0) : specLine(l)} />
              <Spec k="Location" v={l.location} />
            </dl>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="eyebrow text-mute">{l.series} Series · {l.location}</div>
          <h1 className="display mt-3 text-[clamp(28px,3.4vw,42px)] [font-stretch:112%]">{l.title}</h1>
          <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs text-mute">
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{l.location}</span>
            <span className="flex items-center gap-1.5"><Truck className="size-3.5" />{l.delivery}</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="display text-5xl [font-stretch:112%]">{money(allIn(l))}</span>
            <span className="font-mono text-[11px] text-mute">{l.type === 'Auction' ? 'CURRENT BID, ALL-IN' : 'ALL-IN PRICE'}</span>
          </div>
          <details className="group mt-2">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-sm text-mute hover:text-ink">
              What's in this price? <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
            </summary>
            <PriceBreakdown l={l} />
          </details>

          {l.type === 'Auction' ? <AuctionBox l={l} /> : <BuyBox l={l} />}

          <button
            className="btn btn-outline btn-block mt-3"
            onClick={() => (l.real ? toast('Messaging real sellers is coming next.') : navigate({ to: '/messages', search: { t: openThread(seller.name, l.title) } }))}
          >
            <MessageSquare className="size-4" /> Message seller
          </button>

          {l.type === 'Parts' && Array.isArray(l.year) && (
            <div className="panel mt-6 p-5">
              <h3 className="font-semibold">Fitment</h3>
              <p className="mt-1 text-sm text-mute">{l.series} Series, model years {l.year[0]}–{l.year[1]}.</p>
              {rig ? (
                fits(l, rig)
                  ? <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-ok"><Check className="size-4" />Fits your {rig.year} {rig.series} Series</p>
                  : <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-rust"><X className="size-4" />Doesn't match your {rig.year} {rig.series} Series</p>
              ) : (
                <Link to="/garage" className="mt-3 inline-block text-sm font-semibold text-rust">Add your rig to check fitment →</Link>
              )}
            </div>
          )}

          <div className="panel mt-6 flex items-center gap-4 p-5">
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-forest font-semibold text-cream">{seller.name[0]}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2 font-semibold">
                {seller.name}
                {seller.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-forest px-2 py-0.5 font-mono text-[10px] tracking-wide text-cream">
                    <BadgeCheck className="size-3" /> VERIFIED CRUISER
                  </span>
                )}
              </div>
              <div className="font-mono text-xs text-mute">{seller.location} · Member since {seller.since}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="display mb-8 text-[clamp(26px,3vw,36px)] [font-stretch:112%]">More {l.series} Series</h2>
        {more.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{more.map((x) => <ListingCard key={x.id} l={x} />)}</div>
        ) : (
          <p className="text-mute">No other listings in this series yet.</p>
        )}
      </section>
    </div>
  )
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-mono text-[10.5px] uppercase tracking-widest text-mute">{k}</dt>
      <dd className="mt-1 font-medium">{v}</dd>
    </div>
  )
}

function PriceBreakdown({ l }: { l: Listing }) {
  const rows: [string, number][] = [
    [l.type === 'Auction' ? 'Current bid' : 'Item price', l.price],
    [l.shipping ? 'Shipping' : 'Local pickup', l.shipping ?? 0],
    ['Marketplace and buyer protection', fee(l)],
  ]
  return (
    <div className="mt-3 text-[15px]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between border-b border-line py-2.5"><span>{k}</span><span className="font-mono">{money(v)}</span></div>
      ))}
      <div className="flex justify-between py-3 text-lg font-bold"><span>Total</span><span className="font-mono">{money(allIn(l))}</span></div>
    </div>
  )
}

function BuyBox({ l }: { l: Listing }) {
  const { toast } = useStore()
  const [open, setOpen] = useState<'buy' | 'offer' | null>(null)
  const [offer, setOffer] = useState(Math.round(l.price * 0.92))
  const seller = sellerById(l.sellerId)
  return (
    <>
      <div className="mt-6 grid gap-3">
        <button className="btn btn-primary btn-block h-12" onClick={() => (l.real ? toast('Checkout is coming soon.') : setOpen('buy'))}>Buy now</button>
        <button className="btn btn-dark btn-block" onClick={() => (l.real ? toast('Offers are coming soon.') : setOpen('offer'))}>Make an offer</button>
      </div>
      <Dialog open={open === 'buy'} onClose={() => setOpen(null)} title="Checkout">
        <p className="-mt-2 text-mute">{l.title}</p>
        <PriceBreakdown l={l} />
        <button className="btn btn-primary btn-block mt-2" onClick={() => { setOpen(null); toast('Secure checkout opens here in the full build') }}>
          Continue to secure payment
        </button>
        <p className="mt-3 text-center text-xs text-mute">Payments are handled by a trusted third-party processor.</p>
      </Dialog>
      <Dialog open={open === 'offer'} onClose={() => setOpen(null)} title="Make an offer">
        <p className="-mt-2 mb-4 text-mute">Asking {money(l.price)} for the item.</p>
        <label className="field-label">Your offer ($)
          <input className="field" type="number" min={1} step={50} value={offer} onChange={(e) => setOffer(Number(e.target.value))} />
        </label>
        <button className="btn btn-primary btn-block mt-5" disabled={!offer}
          onClick={() => { setOpen(null); toast(`Offer of ${money(offer)} sent to ${seller.name}`) }}>
          Send offer
        </button>
      </Dialog>
    </>
  )
}

function AuctionBox({ l }: { l: LiveListing }) {
  const { verified, placeBid, setEnd, setVerifyOpen, toast } = useStore()
  const min = l.price + MIN_BID_STEP
  const [bid, setBid] = useState(min)
  const now = useNow()
  const ended = !!l.endsAt && now !== null && l.endsAt <= now

  const submit = () => {
    if (!(bid >= min)) return toast('Bid must be at least ' + money(min))
    if (!verified) {
      toast('Verify your account to bid')
      return setVerifyOpen(true)
    }
    const { extended } = placeBid(l.id, bid)
    setBid(bid + MIN_BID_STEP)
    toast(extended ? 'Soft close: your late bid added 2 minutes to the clock' : 'Bid placed. You are the high bidder.')
  }

  return (
    <div className="panel mt-6 p-5">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-mute">Time left</span>
        <span className="flex items-center gap-1.5 rounded-full bg-rust/10 px-2.5 py-1 font-mono text-[11px] text-rust"><Clock className="size-3" /> Soft close</span>
      </div>
      <div className="display mt-2 text-4xl tabular-nums [font-stretch:112%]">{l.endsAt ? <Countdown end={l.endsAt} /> : '—'}</div>
      <p className="mt-2 text-[13px] text-mute">
        {l.bids?.length ?? 0} bids. Bids in the last {SOFT_CLOSE_MS / 60000} minutes extend the clock by {SOFT_CLOSE_MS / 60000} minutes.
      </p>
      <div className="mt-4 flex gap-2">
        <label className="sr-only" htmlFor="bid">Your bid</label>
        <input id="bid" className="field mt-0" type="number" step={MIN_BID_STEP} min={min} value={bid} onChange={(e) => setBid(Number(e.target.value))} disabled={ended} />
        <button className="btn btn-primary h-11 shrink-0" onClick={submit} disabled={ended}>Place bid</button>
      </div>
      <button className="mt-3 text-[13px] font-semibold text-rust hover:underline" onClick={() => setEnd(l.id, Date.now() + 90_000)}>
        Demo: jump to the final 90 seconds
      </button>
      <ul className="mt-4">
        {[...(l.bids ?? [])].reverse().slice(0, 4).map((b, i) => (
          <li key={i} className={cx('flex justify-between border-t border-line py-2.5 text-sm', i === 0 && 'font-semibold')}>
            <span>{b.bidder}{i === 0 && <span className="ml-2 font-mono text-[10px] text-ok">HIGH BID</span>}</span>
            <span className="font-mono">{money(b.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
