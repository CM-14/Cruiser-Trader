import { Link, createFileRoute } from '@tanstack/react-router'
import { SERIES } from '@/data/fixtures'
import { seriesYears } from '@/lib/format'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/PageHeader'

export const Route = createFileRoute('/series-guide')({
  head: () => ({ meta: [{ title: 'Series guide — Cruiser Trader' }] }),
  component: SeriesGuide,
})

function SeriesGuide() {
  const { listings } = useStore()
  return (
    <>
      <PageHeader title="Series guide" sub="Every Land Cruiser generation at a glance. Pick one to see what's for sale." />
      <div className="container-x grid gap-6 pb-24 pt-10 sm:grid-cols-2 lg:grid-cols-4">
        {SERIES.map((s) => {
          const count = listings.filter((l) => l.series === s.id).length
          return (
            <Link key={s.id} to="/vehicles" search={{ s: s.id }}
              className="group overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(0,0,0,.3)]">
              <div className="relative flex aspect-[4/3] items-end p-5 text-cream" style={{ background: `linear-gradient(160deg, ${s.tint[0]}, ${s.tint[1]})` }}>
                <div className="topo absolute inset-0" />
                <span className="eyebrow absolute left-4 top-4 rounded-full bg-black/40 px-2.5 py-1 text-[10px]">{seriesYears(s.id)}</span>
                <b className="display relative text-7xl">{s.id}</b>
              </div>
              <div className="p-5">
                <h3 className="font-semibold">{s.id} Series <span className="font-normal text-mute">· {s.nickname}</span></h3>
                <p className="mt-1.5 text-sm text-mute">{s.blurb}</p>
                <p className="mt-4 font-mono text-[11px] text-rust">{count} {count === 1 ? 'LISTING' : 'LISTINGS'} →</p>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
