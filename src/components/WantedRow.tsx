import { useNavigate } from '@tanstack/react-router'
import type { WantedPost } from '@/data/fixtures'
import { useStore } from '@/lib/store'

export function WantedRow({ w }: { w: WantedPost }) {
  const { openThread } = useStore()
  const navigate = useNavigate()
  return (
    <div className="grid items-center gap-2 border-b border-line py-6 first:border-t first:border-t-ink md:grid-cols-[1.6fr_1fr_1fr_auto] md:gap-6">
      <div>
        <h3 className="text-[18px] font-semibold leading-snug">{w.title}</h3>
        <span className="font-mono text-xs text-mute">{w.series} Series · {w.user}</span>
      </div>
      <span className="font-mono text-[13px] text-mute">{w.budget}</span>
      <span className="font-mono text-[13px] text-mute">{w.region}</span>
      <button
        className="btn btn-outline btn-sm justify-self-start md:justify-self-end"
        onClick={() => navigate({ to: '/messages', search: { t: openThread(w.user, 'Wanted: ' + w.title) } })}
      >
        I have this
      </button>
    </div>
  )
}
