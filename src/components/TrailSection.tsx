import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { cx } from '@/lib/format'

const STAGES = [
  { terrain: 'Pavement', title: 'Vehicles', body: 'Documented rigs from FJ40s to the 300 Series. One honest, all-in price.', cta: 'Browse vehicles', to: '/vehicles',
    path: 'M0 40 L1000 40' },
  { terrain: 'Gravel', title: 'Parts', body: 'Fitment by series and year range, so it fits the first time.', cta: 'Browse parts', to: '/parts',
    path: 'M0 40 L120 38 L240 41 L360 39 L480 41 L600 38 L720 41 L840 39 L1000 40' },
  { terrain: 'Mud', title: 'Auctions', body: 'Timed auctions with soft close. A late bid extends the clock, so nobody gets sniped.', cta: 'View auctions', to: '/auctions',
    path: 'M0 40 Q40 22 80 40 T160 40 T240 40 T320 40 T400 40 T480 40 T560 40 T640 40 T720 40 T800 40 T880 40 T960 40 T1040 40' },
  { terrain: 'Rock', title: 'Wanted', body: 'Post what you are hunting for. Sellers come to you.', cta: 'See wanted posts', to: '/wanted',
    path: 'M0 40 L60 34 L110 46 L170 30 L230 44 L300 28 L360 46 L440 32 L520 44 L600 30 L680 46 L760 34 L840 44 L920 32 L1000 40' },
] as const

/** Scroll-pinned section: a line-drawn FJ40 drives across four terrains as you scroll. */
export function TrailSection() {
  const root = useRef<HTMLDivElement>(null)
  const car = useRef<SVGSVGElement>(null)
  const wheels = useRef<SVGGElement[]>([])
  const [stage, setStage] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = root.current, c = car.current
      if (!el || !c) return
      const r = el.getBoundingClientRect()
      const p = Math.max(0, Math.min(1, -r.top / (el.offsetHeight - window.innerHeight)))
      const cw = c.getBoundingClientRect().width || 260
      c.style.transform = `translateX(${p * (window.innerWidth - cw - 16)}px)`
      wheels.current.forEach((w) => (w.style.transform = `rotate(${p * 1800}deg)`))
      setStage(Math.min(3, Math.floor(p * 4)))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])

  const s = STAGES[stage]
  const wheel = (x: number, i: number) => (
    <g ref={(g) => { if (g) wheels.current[i] = g }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
      <circle cx={x} cy="88" r="24" fill="#12110e" />
      <circle cx={x} cy="88" r="11" />
      <path d={`M${x} 64v48M${x - 24} 88h48`} />
    </g>
  )

  return (
    <section ref={root} className="relative h-[300vh]" aria-label="What you can do on Cruiser Trader">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden bg-night text-cream">
        <div className="topo absolute inset-0 opacity-60" />
        <div className="container-x relative w-full">
          <div key={stage} className="rise max-w-xl">
            <div className="eyebrow text-sand">0{stage + 1} / {s.terrain}</div>
            <h2 className="display mt-4 text-[clamp(44px,8vw,104px)]">{s.title}</h2>
            <p className="mt-5 max-w-md text-lg text-[#bdb6a2]">{s.body}</p>
            <Link to={s.to} className="btn btn-primary mt-8">{s.cta} <ArrowRight className="size-4" /></Link>
          </div>
          <ol className="absolute right-8 top-1/2 hidden -translate-y-1/2 flex-col gap-4 font-mono text-[11px] tracking-widest md:flex">
            {STAGES.map((t, i) => (
              <li key={t.terrain} className={cx('flex items-center justify-end gap-3 uppercase transition-colors', i === stage ? 'text-sand' : 'text-[#6f6a5c]')}>
                {t.terrain}
                <span className={cx('transition-all', i === stage ? 'h-0.5 w-11 bg-rust' : 'h-px w-5 bg-current')} />
              </li>
            ))}
          </ol>
        </div>
        <div className="absolute inset-x-0 bottom-[7vh] h-[150px]" aria-hidden>
          <svg viewBox="0 0 1000 150" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            <path d={s.path} fill="none" stroke="#d8c7a3" strokeWidth="2" vectorEffect="non-scaling-stroke" transform="translate(0 6)" className="transition-all duration-500" />
          </svg>
          <svg ref={car} viewBox="0 0 320 120" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"
            className="absolute bottom-3 left-0 w-[min(300px,56vw)] text-cream will-change-transform">
            <path d="M14 84V54q0-6 7-8l32-6 15-22q3-5 9-5h152q7 0 10 6l15 21 38 6q8 2 8 9v29h-18M96 84h92M14 84h16" />
            <path d="M70 40l10-19h56v19zM142 21h62l12 19h-74zM226 21h12l15 19h-27z" />
            <path d="M78 15h150M96 15v-4M210 15v-4M250 59h14" />
            {wheel(78, 0)}
            {wheel(246, 1)}
          </svg>
        </div>
      </div>
    </section>
  )
}
