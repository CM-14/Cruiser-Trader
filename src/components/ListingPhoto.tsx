import { seriesById, img, cx } from '@/lib/format'
import type { Listing } from '@/data/fixtures'

/** Listing photo with a series-tinted fallback when no image exists. */
export function ListingPhoto({ l, w, h, className, eager }: { l: Listing; w: number; h: number; className?: string; eager?: boolean }) {
  const [c1, c2] = seriesById(l.series).tint
  return (
    <div
      className={cx('relative overflow-hidden', className)}
      style={{ background: `linear-gradient(160deg, ${c1}, ${c2})` }}
    >
      {l.image ? (
        <img
          src={img(l.image, w, h)}
          alt={l.title}
          loading={eager ? 'eager' : 'lazy'}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <span className="display absolute bottom-3 left-4 text-6xl text-cream/85">{l.series}</span>
      )}
    </div>
  )
}
