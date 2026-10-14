import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, ShieldAlert, X } from 'lucide-react'
import { FEE_RATE, type SeriesId } from '@/data/fixtures'
import { cx, money } from '@/lib/format'
import { createListing, loadCategories, setListingStatus } from '@/lib/listings'
import { useStore } from '@/lib/store'
import { sellSearch } from '@/lib/search'
import { PageHeader } from '@/components/PageHeader'
import { SeriesOptions } from '@/components/SeriesSelect'

export const Route = createFileRoute('/sell')({
  validateSearch: sellSearch,
  component: SellPage,
})

type Kind = 'Vehicle' | 'Parts'
const TYPES: { value: Kind; label: string }[] = [
  { value: 'Vehicle', label: 'Vehicle' },
  { value: 'Parts', label: 'Part' },
]
const MAX_PHOTOS = 8

function SellPage() {
  const { t } = Route.useSearch()
  const { user, profile, setVerifyOpen, refreshListings, toast } = useStore()
  const navigate = useNavigate()
  const [type, setType] = useState<Kind>(t === 'Parts' ? 'Parts' : 'Vehicle')
  const [series, setSeries] = useState<SeriesId>(40)
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [price, setPrice] = useState('')
  const [mileage, setMileage] = useState('')
  const [delivery, setDelivery] = useState<'ship' | 'pickup'>('pickup')
  const [shipping, setShipping] = useState('')
  const [city, setCity] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(0)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Follow the mega-menu links ("List a part", …) even when already on this page.
  useEffect(() => { if (t) setType(t === 'Parts' ? 'Parts' : 'Vehicle') }, [t])
  useEffect(() => { loadCategories().then((c) => { setCategories(c); if (c[0]) setCategory(c[0].id) }) }, [])

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  const isPart = type === 'Parts'
  const p = Number(price) || 0
  const ship = isPart && delivery === 'ship' ? Number(shipping) || 0 : 0

  const addFiles = (list: FileList | null) => {
    if (!list) return
    setFiles((cur) => [...cur, ...Array.from(list)].slice(0, MAX_PHOTOS))
  }

  const submit = async (publish: boolean) => {
    setError('')
    if (!user) {
      toast('Sign in to list something')
      return setVerifyOpen(true)
    }
    const y = Number(year)
    if (title.trim().length < 5) return setError('Add a title of at least 5 characters.')
    if (!y || y < 1950 || y > 2100) return setError('Add a valid year.')
    if (!p) return setError('Add a price.')
    if (isPart && !category) return setError('Choose a part category.')
    const [cityName, st] = city.split(',').map((x) => x.trim())

    setBusy(true)
    const made = await createListing(user.id, {
      kind: isPart ? 'part' : 'vehicle',
      title: title.trim(),
      description: description.trim(),
      price: p,
      shipping: ship,
      delivery: isPart ? delivery : 'pickup',
      city: cityName ?? '',
      state: (st ?? '').toUpperCase().slice(0, 2),
      series,
      year: y,
      yearTo: isPart ? Number(yearTo) || y : undefined,
      mileage: !isPart ? Number(mileage.replace(/\D/g, '')) || undefined : undefined,
      categoryId: isPart ? category : undefined,
    }, files)

    if (!made.id) {
      setBusy(false)
      return setError(made.error ?? 'Could not save the listing.')
    }
    if (made.error || made.photoError) toast(made.error ?? made.photoError ?? '')

    if (!publish) {
      setBusy(false)
      toast('Saved as a draft')
      return navigate({ to: '/my-listings' })
    }
    const status = await setListingStatus(made.id, isPart ? 'active' : 'pending_review')
    setBusy(false)
    if (status.error) {
      toast(`Saved as a draft. ${status.error}`)
      return navigate({ to: '/my-listings' })
    }
    await refreshListings()
    if (isPart) {
      toast('Listing published')
      return navigate({ to: '/listing/$id', params: { id: made.id } })
    }
    toast('Submitted for review')
    navigate({ to: '/my-listings' })
  }

  const idVerified = !!profile?.id_verified

  return (
    <>
      <PageHeader title="Sell on Cruiser Trader" sub="List a vehicle or part. Fees are built into the buyer's all-in price, so you keep what you ask." />
      <div className="container-x grid items-start gap-10 pb-24 pt-10 lg:grid-cols-[1fr_340px]">
        <form onSubmit={(e) => { e.preventDefault(); void submit(true) }} className="space-y-8">
          <div className={cx('flex flex-wrap items-center gap-4 rounded-2xl p-5', idVerified ? 'bg-forest text-cream' : 'border border-rust/30 bg-rust/5')}>
            {idVerified ? <BadgeCheck className="size-6" /> : <ShieldAlert className="size-6 text-rust" />}
            <div className="flex-1">
              <b>{!user ? 'Sign in to sell' : idVerified ? 'Verified Cruiser' : 'Drafts only for now'}</b>
              <p className={cx('text-sm', idVerified ? 'text-cream/80' : 'text-mute')}>
                {!user ? 'Create a free account to list a vehicle or part.'
                  : idVerified ? 'Your listings carry the Verified Cruiser badge.'
                  : 'You can save drafts now. Publishing needs a verified ID, and ID checks are coming soon.'}
              </p>
            </div>
            {!user && <button type="button" className="btn btn-primary btn-sm" onClick={() => setVerifyOpen(true)}>Sign in</button>}
          </div>
          {t === 'Auction' && <p className="rounded-xl bg-card px-4 py-3 text-sm text-mute">Auctions are coming soon. For now you can list this as a fixed-price vehicle.</p>}

          <fieldset>
            <legend className="field-label mb-2">Listing type</legend>
            <div className="grid grid-cols-2 gap-2 rounded-full border border-line bg-card p-1">
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
            {isPart && (
              <label className="field-label">Category
                <select className="field" value={category} onChange={(e) => setCategory(Number(e.target.value))}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            )}
            <label className="field-label">Price ($)<input className="field" type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} /></label>
            {!isPart && <label className="field-label">Mileage<input className="field" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="120,000" /></label>}
            {isPart && <>
              <label className="field-label">Delivery<select className="field" value={delivery} onChange={(e) => setDelivery(e.target.value as 'ship' | 'pickup')}><option value="pickup">Local pickup</option><option value="ship">Ships</option></select></label>
              {delivery === 'ship' && <label className="field-label">Shipping cost ($)<input className="field" type="number" value={shipping} onChange={(e) => setShipping(e.target.value)} placeholder="0" /></label>}
            </>}
            <label className="field-label">City, state<input className="field" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Spokane, WA" /></label>
            <label className="field-label sm:col-span-2">Description<textarea className="field" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="History, condition, records, mods…" /></label>
            <div className="sm:col-span-2">
              <label className="field-label">Photos (up to {MAX_PHOTOS}, the first is the cover)
                <input className="field" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
              </label>
              {previews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {previews.map((src, i) => (
                    <div key={src} className="relative">
                      <img src={src} alt={`Photo ${i + 1}`} className="size-24 rounded-xl object-cover" />
                      <button type="button" aria-label="Remove photo" onClick={() => setFiles((f) => f.filter((_, j) => j !== i))}
                        className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-ink text-paper"><X className="size-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <p role="alert" className="text-sm font-semibold text-rust">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary h-12 px-8" disabled={busy}>
              {busy ? 'Saving…' : isPart ? 'Publish listing' : 'Submit for review'}
            </button>
            <button type="button" className="btn btn-outline h-12 px-8" disabled={busy} onClick={() => void submit(false)}>Save draft</button>
          </div>
        </form>

        <aside className="panel p-6 lg:sticky lg:top-24">
          <h2 className="font-semibold">What buyers see</h2>
          <div className="mt-4 space-y-2.5 text-[15px]">
            <Row k="You receive" v={money(p)} />
            <Row k="Marketplace fee (paid by buyer)" v={money(Math.round(p * FEE_RATE))} />
            {isPart && delivery === 'ship' && <Row k="Shipping" v={money(ship)} />}
            <div className="flex justify-between border-t border-line pt-3 text-lg font-bold">
              <span>Buyer's all-in price</span>
              <span className="font-mono">{money(p + Math.round(p * FEE_RATE) + ship)}</span>
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
