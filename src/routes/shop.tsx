import { createFileRoute } from '@tanstack/react-router'
import { Browse } from '@/components/Browse'
import { browseSearch } from '@/lib/search'

export const Route = createFileRoute('/shop')({
  validateSearch: browseSearch,
  component: () => <Browse path="/shop" search={Route.useSearch()} />,
})
