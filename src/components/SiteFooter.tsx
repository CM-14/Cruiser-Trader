import { Link } from '@tanstack/react-router'
import type { AppPath } from '@/lib/paths'

const COLS: [string, [string, AppPath][]][] = [
  ['Market', [['Vehicles', '/vehicles'], ['Parts', '/parts'], ['Auctions', '/auctions'], ['Wanted', '/wanted'], ['Sell', '/sell']]],
  ['Community', [['Verified Cruisers', '/verified'], ['My Garage', '/garage'], ['Series guide', '/series-guide'], ['Messages', '/messages']]],
  ['Company', [['About', '/about'], ['Help', '/help'], ['Contact', '/contact']]],
]

export function SiteFooter() {
  return (
    <footer className="bg-night text-[#a8a18d]">
      <div className="container-x grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Link to="/" className="mb-5 flex items-center gap-3 text-cream">
            <img src="/logo.png" alt="" width={44} height={44} className="size-11 rounded-full" />
            <span className="display text-[17px] tracking-[.02em]">CRUISER TRADER</span>
          </Link>
          <p className="text-sm">The marketplace for Land Cruiser enthusiasts. Vehicles, parts and auctions from the 40 to the 300 Series.</p>
        </div>
        {COLS.map(([title, links]) => (
          <div key={title}>
            <h4 className="eyebrow mb-4 text-cream">{title}</h4>
            <ul className="space-y-2 text-sm">
              {links.map(([label, to]) => (
                <li key={label}><Link to={to} className="transition-colors hover:text-cream">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-wrap justify-between gap-3 py-6 font-mono text-[11px] tracking-wide">
          <span>© {new Date().getFullYear()} Cruiser Trader</span>
          <span>Not affiliated with Toyota Motor Corporation. Listings shown are samples.</span>
        </div>
      </div>
    </footer>
  )
}
