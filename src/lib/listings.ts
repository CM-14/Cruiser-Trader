import { SERIES, type Listing, type Seller, type SeriesId } from '@/data/fixtures'
import { messageOf, publicPhotoUrl, rest, uploadPhoto, type Json } from './supabase'

const SELECT = [
  'id', 'seller_id', 'kind', 'sale_type', 'status', 'title', 'description', 'price_cents', 'shipping_cents',
  'delivery', 'city', 'state', 'year', 'series_code', 'mileage', 'published_at', 'created_at',
  'listing_photos(storage_path,position)',
  'listing_fitment(year_start,year_end)',
  'category:part_categories(slug)',
  'seller:profiles!seller_id(username,display_name,city,state,id_verified,created_at)',
].join(',')

/** Turn a database row into the shape the screens already use. */
function fromRow(r: Json): { listing: Listing; seller: Seller } {
  const isPart = r.kind === 'part'
  const series = Number(r.series_code) as SeriesId
  const base = SERIES.find((x) => x.id === series)
  const fit: { year_start: number; year_end: number }[] = r.listing_fitment ?? []
  const year: number | [number, number] = isPart
    ? fit.length
      ? [Math.min(...fit.map((f) => f.year_start)), Math.max(...fit.map((f) => f.year_end))]
      : [base?.from ?? 0, base?.to ?? 0]
    : r.year ?? 0
  const photos = ([...(r.listing_photos ?? [])] as { storage_path: string; position: number }[])
    .sort((a, b) => a.position - b.position)
    .map((p) => publicPhotoUrl(p.storage_path))
  const p = r.seller
  const seller: Seller = {
    id: `db:${r.seller_id}`,
    name: p?.display_name || p?.username || 'Seller',
    verified: !!p?.id_verified,
    location: [p?.city, p?.state].filter(Boolean).join(', ') || 'Location not listed',
    since: p?.created_at ? String(p.created_at).slice(0, 4) : '2026',
  }
  const listing: Listing = {
    id: r.id,
    title: r.title,
    series,
    type: isPart ? 'Parts' : r.sale_type === 'auction' ? 'Auction' : 'Vehicle',
    price: Math.round(Number(r.price_cents) / 100),
    year,
    mileage: r.mileage != null ? `${Number(r.mileage).toLocaleString('en-US')} mi` : undefined,
    location: [r.city, r.state].filter(Boolean).join(', ') || 'Location not listed',
    delivery: r.delivery === 'pickup' ? 'Local pickup' : 'Ships',
    shipping: r.shipping_cents ? Math.round(Number(r.shipping_cents) / 100) : undefined,
    sellerId: seller.id,
    image: photos[0],
    images: photos,
    description: r.description || undefined,
    category: r.category?.slug,
    real: true,
    status: r.status,
  }
  return { listing, seller }
}

/** Live and sold listings, visible to everyone. */
export async function loadPublicListings(): Promise<{ listings: Listing[]; sellers: Seller[] }> {
  const r = await rest(`/listings?select=${SELECT}&status=in.(active,sold)&order=published_at.desc.nullslast&limit=100`)
  if (!r.ok || !Array.isArray(r.body)) {
    console.warn('Could not load listings', r.body)
    return { listings: [], sellers: [] }
  }
  const rows = (r.body as Json[]).map(fromRow)
  return { listings: rows.map((x) => x.listing), sellers: rows.map((x) => x.seller) }
}

/** Every listing the signed-in member owns, in any status. */
export async function loadMyListings(userId: string): Promise<Listing[]> {
  const r = await rest(`/listings?select=${SELECT}&seller_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`, { auth: true })
  if (!r.ok || !Array.isArray(r.body)) {
    console.warn('Could not load your listings', r.body)
    return []
  }
  return (r.body as Json[]).map((x) => fromRow(x).listing)
}

export interface NewListing {
  kind: 'vehicle' | 'part'
  title: string
  description: string
  /** Whole dollars. */
  price: number
  shipping: number
  delivery: 'ship' | 'pickup'
  city: string
  state: string
  series: number
  year: number
  yearTo?: number
  mileage?: number
  categoryId?: number
}

/** Shrink a photo in the browser so uploads are fast and storage stays small. */
async function resize(file: File, max = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  return new Promise((ok, fail) =>
    canvas.toBlob((b) => (b ? ok(b) : fail(new Error('resize'))), 'image/jpeg', 0.82))
}

/** Save a new listing as a draft, then its fitment and photos. */
export async function createListing(userId: string, n: NewListing, photos: File[]): Promise<{ id?: string; error?: string; photoError?: string }> {
  const isPart = n.kind === 'part'
  const made = await rest('/listings', {
    method: 'POST', auth: true, prefer: 'return=representation',
    body: {
      seller_id: userId,
      kind: n.kind,
      sale_type: 'fixed',
      title: n.title,
      description: n.description,
      price_cents: Math.round(n.price * 100),
      shipping_cents: Math.round(n.shipping * 100),
      delivery: n.delivery,
      city: n.city || null,
      state: n.state || null,
      series_code: String(n.series),
      year: isPart ? null : n.year,
      mileage: isPart ? null : n.mileage ?? null,
      category_id: isPart ? n.categoryId : null,
    },
  })
  const row = Array.isArray(made.body) ? made.body[0] : null
  if (!made.ok || !row) return { error: messageOf(made.body, 'Could not save the listing.') }
  const id: string = row.id

  if (isPart) {
    const f = await rest('/listing_fitment', {
      method: 'POST', auth: true,
      body: { listing_id: id, series_code: String(n.series), year_start: n.year, year_end: n.yearTo ?? n.year },
    })
    if (!f.ok) return { id, error: messageOf(f.body, 'Saved, but the fitment years were rejected.') }
  }

  const done: { listing_id: string; storage_path: string; position: number; is_primary: boolean }[] = []
  let photoError: string | undefined
  for (let i = 0; i < photos.length; i++) {
    try {
      const blob = await resize(photos[i])
      const path = `${userId}/${id}/${i + 1}.jpg`
      const up = await uploadPhoto(path, blob)
      if (up.error) { photoError = up.error; break }
      done.push({ listing_id: id, storage_path: path, position: i, is_primary: i === 0 })
    } catch {
      photoError = 'One of the photos could not be read. Use JPEG or PNG images.'
      break
    }
  }
  if (done.length) {
    const rows = await rest('/listing_photos', { method: 'POST', auth: true, body: done })
    if (!rows.ok) photoError = messageOf(rows.body, 'Photos uploaded but could not be attached.')
  }
  return { id, photoError }
}

/** Move a listing between statuses. The database enforces who is allowed to. */
export async function setListingStatus(id: string, status: string): Promise<{ error?: string }> {
  const r = await rest(`/listings?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH', auth: true, prefer: 'return=representation', body: { status },
  })
  if (!r.ok) return { error: messageOf(r.body, 'Could not update the listing.') }
  return Array.isArray(r.body) && r.body.length ? {} : { error: 'Could not update the listing.' }
}

export async function deleteListing(id: string): Promise<{ error?: string }> {
  const r = await rest(`/listings?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', auth: true })
  return r.ok ? {} : { error: messageOf(r.body, 'Could not delete the listing.') }
}

export async function loadCategories(): Promise<{ id: number; name: string }[]> {
  const r = await rest('/part_categories?select=id,name&order=sort_order')
  return r.ok && Array.isArray(r.body) ? (r.body as { id: number; name: string }[]) : []
}
