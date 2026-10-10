import { Link } from '@tanstack/react-router'
import { Check, Clock } from 'lucide-react'
import { allIn, fits, money, specLine, typeLabel } from '@/lib/format'
import { useStore, type LiveListing } from '@/lib/store'
import { ListingPhoto } from './ListingPhoto'
import { Countdown } from './Countdown'

export function ListingCard({ l }: { l: LiveListing }) {
  const { rig } = useStore()
  const auction = l.type === 'Auction'
  return (
    <Link
      to="/listing/$id"
      params={{ id: l.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(0,0,0,.3)]"
    >
      <div className="relative">
        <ListingPhoto l={l} w={640} h={480} className="aspect-[4/3] [&>img]:transition-transform [&>img]:duration-700 group-hover:[&>img]:scale-[1.04]" />
        <span className="eyebrow absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-cream backdrop-blur">{typeLabel(l)}</span>
        {auction && l.endsAt && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-rust px-2.5 py-1 font-mono text-[11px] text-white">
            <Clock className="size-3" /> <Countdown end={l.endsAt} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="eyebrow text-[10.5px] text-mute">{l.series} Series · {l.location}</div>
        <h3 className="mt-1.5 text-[16px] font-semibold leading-snug">{l.title}</h3>
        <div className="mb-5 mt-2 flex flex-wrap gap-x-3 font-mono text-[11.5px] text-mute">
          <span>{specLine(l)}</span>
          <span>{l.delivery}</span>
        </div>
        <div className="mt-auto flex items-baseline justify-between border-t border-line pt-4">
          <span className="display text-2xl [font-stretch:112%]">{money(allIn(l))}</span>
          <span className="font-mono text-[10.5px] text-mute">{auction ? 'CURRENT BID' : 'ALL-IN'}</span>
        </div>
        {rig && fits(l, rig) && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ok">
            <Check className="size-3.5" /> Fits your {rig.year} {rig.series} Series
          </div>
        )}
      </div>
    </Link>
  )
}
