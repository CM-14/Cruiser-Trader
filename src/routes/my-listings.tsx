import { Link, createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import type { Listing } from '@/data/fixtures'
import { allIn, cx, money } from '@/lib/format'
import { deleteListing, loadMyListings, setListingStatus } from '@/lib/listings'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/PageHeader'
import { ListingPhoto } from '@/components/ListingPhoto'

export const Route = createFileRoute('/my-listings')({
  component: MyListingsPage,
})

const LABEL: Record<string, string> = {
  draft: 'Draft', pending_review: 'In review', active: 'Live', sold: 'Sold', ended: 'Ended', removed: 'Removed',
}

function MyListingsPage() {
  const { user, authReady, setVerifyOpen, refreshListings, toast } = useStore()
  const uid = user?.id
  const [items, setItems] = useState<Listing[] | null>(null)
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    if (uid) setItems(await loadMyListings(uid))
  }, [uid])
  useEffect(() => { void load() }, [load])

  const act = async (l: Listing, what: 'publish' | 'end' | 'delete') => {
    setBusy(l.id)
    const r = what === 'delete'
      ? await deleteListing(l.id)
      : await setListingStatus(l.id, what === 'end' ? 'ended' : l.type === 'Parts' ? 'active' : 'pending_review')
    setBusy('')
    if (r.error) return toast(r.error)
    toast(what === 'delete' ? 'Draft deleted' : what === 'end' ? 'Listing ended' : l.type === 'Parts' ? 'Listing published' : 'Submitted for review')
    await load()
    await refreshListings()
  }

  if (!authReady) return <><PageHeader title="My listings" sub="" /><div className="container-x py-12 text-mute">Loading…</div></>
  if (!user) {
    return (
      <>
        <PageHeader title="My listings" sub="Sign in to see your drafts and live listings." />
        <div className="container-x py-12"><button className="btn btn-primary" onClick={() => setVerifyOpen(true)}>Sign in</button></div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="My listings" sub="Drafts, listings in review, and live listings." />
      <div className="container-x pb-24 pt-10">
        <Link to="/sell" className="btn btn-primary mb-8">New listing</Link>
        {items === null ? <p className="text-mute">Loading…</p> : items.length === 0 ? (
          <div className="panel px-6 py-16 text-center text-mute">You haven't listed anything yet.</div>
        ) : (
          <ul className="space-y-4">
            {items.map((l) => (
              <li key={l.id} className="panel flex flex-wrap items-center gap-5 p-4">
                <ListingPhoto l={l} w={240} h={180} className="size-24 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <b className="text-[17px]">{l.title}</b>
                    <span className={cx('eyebrow rounded-full px-2.5 py-1 text-[10px]',
                      l.status === 'active' ? 'bg-forest text-cream' : 'bg-card text-mute ring-1 ring-line')}>{LABEL[l.status ?? ''] ?? l.status}</span>
                  </div>
                  <div className="mt-1 font-mono text-xs text-mute">{l.series} Series · {money(allIn(l))} all-in · {l.images?.length ?? 0} photos</div>
                  {l.status === 'pending_review' && <p className="mt-1 text-sm text-mute">Vehicles are checked by our team before going live.</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {l.status === 'active' && <Link to="/listing/$id" params={{ id: l.id }} className="btn btn-outline btn-sm">View</Link>}
                  {(l.status === 'draft' || l.status === 'ended') && <button className="btn btn-primary btn-sm" disabled={busy === l.id} onClick={() => void act(l, 'publish')}>{l.type === 'Parts' ? 'Publish' : 'Submit for review'}</button>}
                  {l.status === 'active' && <button className="btn btn-outline btn-sm" disabled={busy === l.id} onClick={() => void act(l, 'end')}>End listing</button>}
                  {l.status === 'draft' && <button className="btn btn-outline btn-sm" disabled={busy === l.id} onClick={() => void act(l, 'delete')}>Delete</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
