import { createFileRoute } from '@tanstack/react-router'
import { InfoPage } from '@/components/InfoPage'

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [{ title: 'Contact — Cruiser Trader' }] }),
  component: () => (
    <InfoPage title="Contact" sub="We'd love to hear from you.">
      <p>Questions, feedback, or want to list inventory in bulk? Email us and a real person will reply.</p>
      <a href="mailto:hello@cruisertrader.example" className="btn btn-primary">hello@cruisertrader.example</a>
    </InfoPage>
  ),
})
