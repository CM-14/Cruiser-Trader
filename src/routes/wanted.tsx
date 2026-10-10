import { createFileRoute } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import type { SeriesId } from '@/data/fixtures'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/PageHeader'
import { WantedRow } from '@/components/WantedRow'
import { SeriesOptions } from '@/components/SeriesSelect'

export const Route = createFileRoute('/wanted')({
  component: WantedPage,
})

function WantedPage() {
  const { wanted, addWanted, toast } = useStore()
  const [form, setForm] = useState({ title: '', series: 40 as SeriesId, budget: '', region: '' })
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: k === 'series' ? Number(e.target.value) : e.target.value }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return toast('Describe what you need')
    addWanted({
      id: 'w' + Date.now(),
      title: form.title.trim(),
      series: form.series,
      budget: form.budget.trim() || 'Open budget',
      region: form.region.trim() || 'Anywhere',
      user: 'You',
    })
    setForm((f) => ({ ...f, title: '', budget: '', region: '' }))
    toast('Wanted ad posted')
  }

  return (
    <>
      <PageHeader title="Wanted" sub="Buyers post what they're hunting for. If you have it, respond directly." />
      <div className="container-x grid items-start gap-10 pb-24 pt-10 lg:grid-cols-[340px_1fr]">
        <form onSubmit={submit} className="panel space-y-4 p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Post a wanted ad</h2>
          <label className="field-label">What are you looking for?<input className="field" value={form.title} onChange={set('title')} placeholder="e.g. FJ62 rear bumper" /></label>
          <label className="field-label">Series<select className="field" value={form.series} onChange={set('series')}><SeriesOptions /></select></label>
          <label className="field-label">Budget<input className="field" value={form.budget} onChange={set('budget')} placeholder="Up to $500" /></label>
          <label className="field-label">Region<input className="field" value={form.region} onChange={set('region')} placeholder="Within 300 mi of Spokane" /></label>
          <button className="btn btn-primary btn-block">Post wanted ad</button>
        </form>
        <div>
          <p className="mb-4 font-mono text-xs text-mute">{wanted.length} OPEN POSTS</p>
          {wanted.map((w) => <WantedRow key={w.id} w={w} />)}
        </div>
      </div>
    </>
  )
}
