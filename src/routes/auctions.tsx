import { createFileRoute } from '@tanstack/react-router'
import { Browse } from '@/components/Browse'
import { browseSearch } from '@/lib/search'

export const Route = createFileRoute('/auctions')({
  validateSearch: browseSearch,
  component: () => <Browse type="Auction" path="/auctions" search={Route.useSearch()} />,
})
