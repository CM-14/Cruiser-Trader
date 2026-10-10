import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { InfoPage } from '@/components/InfoPage'

export const Route = createFileRoute('/help')({
  head: () => ({ meta: [{ title: 'Help — Cruiser Trader' }] }),
  component: HelpPage,
})

const FAQ = [
  ['Is the price I see the price I pay?', "Yes. Every price is final and all-in: item, shipping and the 7% marketplace and buyer-protection fee. Open “What's in this price?” on any listing for the full breakdown."],
  ['How does soft close work?', 'A bid placed in the last 2 minutes of an auction extends the clock by 2 minutes. Bidding ends only when two minutes pass without a new bid, so nobody gets sniped.'],
  ['How does fitment work?', 'Save your rig in My Garage. Parts list the series and model-year range they fit, and every page flags what matches your truck.'],
  ['Who can sell or bid?', 'Verified Cruisers only. Verification confirms email, phone and a photo ID.'],
  ['How are payments handled?', 'Payments are handled by a trusted third-party processor. Messages between buyers and sellers stay inside Cruiser Trader.'],
]

function HelpPage() {
  return (
    <InfoPage title="Help" sub="How Cruiser Trader works.">
      <div className="border-t border-ink">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group border-b border-line py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
              {q}<ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-[16px] text-mute">{a}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  )
}
