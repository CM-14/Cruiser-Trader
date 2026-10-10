import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { BadgeCheck, ShieldAlert } from 'lucide-react'
import { FEE_RATE, type Delivery, type ListingType, type SeriesId } from '@/data/fixtures'
import { cx, money } from '@/lib/format'
import { useStore } from '@/lib/store'
import { sellSearch } from '@/lib/search'
import { PageHeader } from '@/components/PageHeader'
import { SeriesOptions } from '@/components/SeriesSelect'

export const Route = createFileRoute('/sell')({
  validateSearch: sellSearch,
  component: SellPage,
})

const TYPES: { value: ListingType; label: string }[] = [
  { value: 'Vehicle', label: 'Vehicle' },
  { value: 'Parts', label: 'Part' },
  { value: 'Auction', label: 'Auction' },
]

function SellPage() {
  const { t } = Route.useSearch()
  const { verified, setVerifyOpen, addListing, toast } = useStore()
  const navigate = useNavigate()
  const [type, setType] = useState<ListingType>(t ?? 'Vehicle')
  const [series, setSeries] = useState<SeriesId>(40)
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [price, setPrice] = useState('')
  const [mileage, setMileage] = useState('')
  const [delivery, setDelivery] = useState<Delivery>('Local pickup')
  const [shipping, setShipping] = useState('')
  const [city, setCity] = useState('')
  const [days, setDays] = useState(7)
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<string>()

  // Follow the mega-menu links ("List a part", …) even when already on this page.
  useEffect(() => { if (t) setType(t) }, [t])

  const isPart = type === 'Parts'
  const p = Number(price) || 0

  const onPhoto = (f?: File) => {
    if (!f) return setPhoto(undefined)
    const r = new FileReader()
    r.onload = () => setPhoto(r.result as string)
    r.readAsDataURL(f)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!verified) {
      toast('Verify your account to publish')
      return setVerifyOpen(true)
    }
    const y = Number(year)
    if (!title.trim() || !p || !y) return toast('Add a title, year and price')
    const id = `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`
    addListing({
      id, type, series, price: p,
      title: title.trim(),
      year: isPart ? [y, Number(yearTo) || y] : y,
      mileage: type === 'Vehicle' ? mileage.trim() || undefined : undefined,
      location: city.trim() || 'Your city',
      delivery: isPart ? delivery : 'Local pickup',
      shipping: isPart && delivery === 'Ships' ? Number(shipping) || 0 : undefined,
      sellerId: 'you',
      image: photo,
      description: description.trim() || undefined,
      endsAt: type === 'Auction' ? Date.now() + days * 86_400_000 : undefined,
      bids: type === 'Auction' ? [] : undefined,
    })
    toast('Listing published')
    navigate({ to: '/listing/$id', params: { id } })
  }

  return (
    <>
      <PageHeader title="Sell on Cruiser Trader" sub="List a vehicle, part or auction. Fees are built into the buyer's all-in price, so you keep what you ask." />
      <div className="container-x grid items-start gap-10 pb-24 pt-10 lg:grid-cols-[1fr_340px]">
        <form onSubmit={submit} className="space-y-8">
          <div className={cx('flex flex-wrap items-center gap-4 rounded-2xl p-5', verified ? 'bg-forest text-cream' : 'border border-rust/30 bg-rust/5')}>
            {verified ? <BadgeCheck className="size-6" /> : <ShieldAlert className="size-6 text-rust" />}
            <div className="flex-1">
              <b>{verified ? 'Verified Cruiser' : 'Verification required'}</b>
              <p className={cx('text-sm', verified ? 'text-cream/80' : 'text-mute')}>
                {verified ? 'Your listings carry the Verified Cruiser badge.' : 'Phone, email and a photo ID are needed before you can publish.'}
              </p>
            </div>
            {!verified && <button type="button" className="btn btn-primary btn-sm" onClick={() => setVerifyOpen(true)}>Verify now</button>}
          </div>

          <fieldset>
            <legend className="field-label mb-2">Listing type</legend>
            <div className="grid grid-cols-3 gap-2 rounded-full border border-line bg-card p-1">
              {TYPES.map((x) => (
                <button key={x.value} type="button" onClick={() => setType(x.value)} aria-pressed={type === x.value}
                  className={cx('h-10 rounded-full text-sm font-semibold transition-colors', type === x.value ? 'bg-ink text-paper' : 'text-mute hover:text-ink')}>
                  {x.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="panel grid gap-5 p-6 sm:grid-cols-2">
            <label className="field-label sm:col-span-2">Title<input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={isPart ? 'e.g. FJ62 rear bumper' : 'e.g. 1991 FJ80 with ARB lockers'} /></label>
            <label className="field-label">Series<select className="field" value={series} onChange={(e) => setSeries(Number(e.target.value) as SeriesId)}><SeriesOptions /></select></label>
            {isPart ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="field-label">Fits from<input className="field" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="1990" /></label>
                <label className="field-label">Fits through<input className="field" type="number" value={yearTo} onChange={(e) => setYearTo(e.target.value)} placeholder="1997" /></label>
              </div>
            ) : (
              <label className="field-label">Model year<input className="field" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="1991" /></label>
            )}
            <label className="field-label">{type === 'Auction' ? 'Starting bid ($)' : 'Price ($)'}<input className="field" type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} /></label>
            {type === 'Vehicle' && <label className="field-label">Mileage<input className="field" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="120,000 mi" /></label>}
            {type === 'Auction' && (
              <label className="field-label">Auction length<select className="field" value={days} onChange={(e) => setDays(Number(e.target.value))}><option value={3}>3 days</option><option value={7}>7 days</option></select></label>
            )}
            {isPart && <>
              <label className="field-label">Delivery<select className="field" value={delivery} onChange={(e) => setDelivery(e.target.value as Delivery)}><option>Ships</option><option>Local pickup</option></select></label>
              {delivery === 'Ships' && <label className="field-label">Shipping cost ($)<input className="field" type="number" value={shipping} onChange={(e) => setShipping(e.target.value)} placeholder="0" /></label>}
            </>}
            <label className="field-label">City<input className="field" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Spokane, WA" /></label>
            <label className="field-label sm:col-span-2">Description<textarea className="field" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="History, condition, records, mods…" /></label>
            <label className="field-label sm:col-span-2">Photo<input className="field" type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0])} /></label>
            {photo && <img src={photo} alt="Listing preview" className="aspect-[4/3] w-48 rounded-xl object-cover sm:col-span-2" />}
          </div>
          <button className="btn btn-primary h-12 px-8">Publish listing</button>
        </form>

        <aside className="panel p-6 lg:sticky lg:top-24">
          <h2 className="font-semibold">What buyers see</h2>
          <div className="mt-4 space-y-2.5 text-[15px]">
            <Row k="You receive" v={money(p)} />
            <Row k="Marketplace fee (paid by buyer)" v={money(Math.round(p * FEE_RATE))} />
            {isPart && delivery === 'Ships' && <Row k="Shipping" v={money(Number(shipping) || 0)} />}
            <div className="flex justify-between border-t border-line pt-3 text-lg font-bold">
              <span>Buyer's all-in price</span>
              <span className="font-mono">{money(p + Math.round(p * FEE_RATE) + (isPart && delivery === 'Ships' ? Number(shipping) || 0 : 0))}</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-mute">You keep exactly what you ask. The fee covers payments, buyer protection and running the marketplace.</p>
        </aside>
      </div>
    </>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between text-mute"><span>{k}</span><span className="font-mono text-ink">{v}</span></div>
}
