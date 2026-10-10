import { createFileRoute } from '@tanstack/react-router'
import { BadgeCheck } from 'lucide-react'
import { useStore } from '@/lib/store'
import { InfoPage } from '@/components/InfoPage'

export const Route = createFileRoute('/verified')({
  head: () => ({ meta: [{ title: 'Verified Cruisers — Cruiser Trader' }] }),
  component: VerifiedPage,
})

function VerifiedPage() {
  const { verified, setVerifyOpen } = useStore()
  return (
    <InfoPage title="Verified Cruisers" sub="Trust is the whole marketplace.">
      <p>Verified Cruisers have confirmed their email, phone number and a photo ID. Their listings carry a badge, and only verified members can bid or publish.</p>
      <ol className="space-y-3">
        {['Confirm your email address', 'Confirm your phone number', 'Upload a photo ID (never shown publicly)'].map((s, i) => (
          <li key={s} className="flex items-center gap-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest font-mono text-sm text-cream">{i + 1}</span>{s}
          </li>
        ))}
      </ol>
      {verified
        ? <p className="flex items-center gap-2 font-semibold text-ok"><BadgeCheck className="size-5" /> You're a Verified Cruiser.</p>
        : <button className="btn btn-primary" onClick={() => setVerifyOpen(true)}>Get verified</button>}
    </InfoPage>
  )
}
