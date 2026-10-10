import { createFileRoute } from '@tanstack/react-router'
import { Browse } from '@/components/Browse'
import { browseSearch } from '@/lib/search'

export const Route = createFileRoute('/parts')({
  validateSearch: browseSearch,
  component: () => <Browse type="Parts" path="/parts" search={Route.useSearch()} />,
})
