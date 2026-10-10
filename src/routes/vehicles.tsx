import { createFileRoute } from '@tanstack/react-router'
import { Browse } from '@/components/Browse'
import { browseSearch } from '@/lib/search'

export const Route = createFileRoute('/vehicles')({
  validateSearch: browseSearch,
  component: () => <Browse type="Vehicle" path="/vehicles" search={Route.useSearch()} />,
})
