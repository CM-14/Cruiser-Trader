import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { TRIMS, type SeriesId } from '@/data/fixtures'
import { fits, seriesById, yearsFor } from '@/lib/format'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/PageHeader'
import { ListingCard } from '@/components/ListingCard'
import { SeriesOptions, YearOptions } from '@/components/SeriesSelect'

export const Route = createFileRoute('/garage')({
  component: GaragePage,
})

function GaragePage() {
  const { rig, saveRig, listings, toast } = useStore()
  const [series, setSeries] = useState<SeriesId>(80)
  const [year, setYear] = useState(1995)
  const [trim, setTrim] = useState<string>(TRIMS[0])
  const [mods, setMods] = useState('')
  const [vin, setVin] = useState('')

  // Load the saved rig into the form once it arrives from localStorage.
  useEffect(() => {
    if (!rig) return
    setSeries(rig.series); setYear(rig.year); setTrim(rig.trim); setMods(rig.mods ?? ''); setVin(rig.vin ?? '')
  }, [rig])

  const changeSeries = (s: SeriesId) => {
    setSeries(s)
    setYear(yearsFor(s)[0])
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    saveRig({ series, year, trim, mods: mods.trim() || undefined, vin: vin.trim() || undefined })
    toast('Garage saved')
  }

  const matches = rig ? listings.filter((l) => fits(l, rig)) : []

  return (
    <>
      <PageHeader title="My Garage" sub="Save your rig once and every page can filter to what fits it." />
      <div className="container-x grid items-start gap-10 pb-16 pt-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-forest-deep p-8 text-cream">
          <div className="topo absolute inset-0" />
          <div className="relative">
            {rig ? <>
              <div className="eyebrow text-sand">Your rig</div>
              <div className="display mt-3 text-[clamp(40px,5vw,64px)]">{rig.year}<br />{rig.series} Series</div>
              <p className="mt-4 text-[#cbc5b2]">{[seriesById(rig.series).nickname, rig.trim, rig.mods, rig.vin && `VIN ${rig.vin}`].filter(Boolean).join(' · ')}</p>
              <p className="mt-8 text-lg"><b className="text-sand">{matches.length}</b> {matches.length === 1 ? 'listing fits' : 'listings fit'} your rig.</p>
              <Link to="/parts" search={{ s: rig.series, y: rig.year }} className="btn btn-primary mt-5">Shop parts that fit</Link>
            </> : <>
              <div className="eyebrow text-sand">Empty bay</div>
              <div className="display mt-3 text-[clamp(36px,4.5vw,56px)]">No rig saved yet.</div>
              <p className="mt-4 max-w-sm text-[#cbc5b2]">Add your Land Cruiser and we'll flag every part and listing that fits it.</p>
            </>}
          </div>
        </div>

        <form onSubmit={submit} className="panel space-y-4 p-6">
          <label className="field-label">Series<select className="field" value={series} onChange={(e) => changeSeries(Number(e.target.value) as SeriesId)}><SeriesOptions /></select></label>
          <div className="grid grid-cols-2 gap-4">
            <label className="field-label">Year<select className="field" value={year} onChange={(e) => setYear(Number(e.target.value))}><YearOptions series={series} /></select></label>
            <label className="field-label">Trim<select className="field" value={trim} onChange={(e) => setTrim(e.target.value)}>{TRIMS.map((t) => <option key={t}>{t}</option>)}</select></label>
          </div>
          <label className="field-label">Mods (optional)<input className="field" value={mods} onChange={(e) => setMods(e.target.value)} placeholder="Lift, lockers, rack" /></label>
          <label className="field-label">VIN (optional)<input className="field" value={vin} onChange={(e) => setVin(e.target.value)} /></label>
          <div className="flex flex-wrap gap-3 pt-1">
            <button className="btn btn-primary">Save rig</button>
            {rig && <button type="button" className="btn btn-outline" onClick={() => { saveRig(null); toast('Rig removed') }}>Remove rig</button>}
          </div>
        </form>
      </div>
      {matches.length > 0 && (
        <section className="container-x pb-24">
          <h2 className="display mb-8 text-[clamp(26px,3vw,36px)] [font-stretch:112%]">Fits your rig</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{matches.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        </section>
      )}
    </>
  )
}
