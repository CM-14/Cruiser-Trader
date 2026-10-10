import { Link, createFileRoute } from '@tanstack/react-router'
import { InfoPage } from '@/components/InfoPage'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About — Cruiser Trader' }] }),
  component: () => (
    <InfoPage title="About" sub="Built by Land Cruiser people, for Land Cruiser people.">
      <p>Cruiser Trader is a marketplace for vehicles, parts and auctions dedicated entirely to the Land Cruiser family, from the 40 Series to the 300 Series.</p>
      <p>Fitment by series and year range is at the heart of everything, so the part you buy is the part that fits. Prices are always all-in, sellers are verified, and auctions close fairly.</p>
      <Link to="/series-guide" className="btn btn-primary">Explore the series guide</Link>
    </InfoPage>
  ),
})
