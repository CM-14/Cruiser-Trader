/**
 * Stub marketplace data. Every screen reads from here (via the store in
 * `src/lib/store.tsx`), so a later milestone can swap this module for real
 * persistence without touching the UI.
 */

export type SeriesId = 40 | 55 | 60 | 70 | 80 | 100 | 200 | 300
export type ListingType = 'Vehicle' | 'Parts' | 'Auction'
export type Delivery = 'Local pickup' | 'Ships'

export interface Series {
  id: SeriesId
  from: number
  to: number
  nickname: string
  blurb: string
  /** Gradient used when a listing has no photo. */
  tint: [string, string]
}

export const SERIES: Series[] = [
  { id: 40, from: 1960, to: 1984, nickname: 'The icon', blurb: 'Short and long wheelbase utilities, built like tractors.', tint: ['#7a2a22', '#2a1512'] },
  { id: 55, from: 1967, to: 1980, nickname: 'Iron Pig', blurb: 'The first purpose-built wagon. Rare and full of character.', tint: ['#44606f', '#1a252c'] },
  { id: 60, from: 1980, to: 1990, nickname: 'Family hauler', blurb: 'The first true family wagon with real comforts.', tint: ['#2F4A3A', '#14201a'] },
  { id: 70, from: 1984, to: 2026, nickname: 'Workhorse', blurb: 'Utility workhorse, still built for many markets.', tint: ['#7b6339', '#2a2214'] },
  { id: 80, from: 1990, to: 1997, nickname: 'Cult classic', blurb: 'Solid axles and legendary durability. A cult favorite.', tint: ['#4f5d45', '#1d2219'] },
  { id: 100, from: 1998, to: 2007, nickname: 'Refined V8', blurb: 'Independent front suspension and V8 refinement.', tint: ['#59676f', '#1e2428'] },
  { id: 200, from: 2008, to: 2021, nickname: 'Flagship', blurb: 'The modern flagship, loaded and capable.', tint: ['#45443f', '#17160f'] },
  { id: 300, from: 2022, to: 2026, nickname: 'New era', blurb: 'The newest generation on a fresh platform.', tint: ['#7d4630', '#241410'] },
]

export const TRIMS = ['Base', 'Standard', 'Limited', 'Heritage', 'Other'] as const

export interface Seller {
  id: string
  name: string
  verified: boolean
  location: string
  since: string
}

export const SELLERS: Seller[] = [
  { id: 'dale', name: 'Dale R.', verified: true, location: 'Boise, ID', since: '2019' },
  { id: 'marcus', name: 'Marcus T.', verified: true, location: 'Spokane, WA', since: '2021' },
  { id: 'hdc', name: 'High Desert Cruisers', verified: true, location: 'Tucson, AZ', since: '2017' },
  { id: 'you', name: 'You', verified: false, location: 'Your city', since: '2026' },
]

export interface Bid {
  bidder: string
  amount: number
}

export interface Listing {
  id: string
  title: string
  series: SeriesId
  type: ListingType
  /** Item price, or current bid for auctions. */
  price: number
  /** Model year for vehicles; fitment range for parts. */
  year: number | [number, number]
  /** Mileage for vehicles. */
  mileage?: string
  location: string
  delivery: Delivery
  shipping?: number
  sellerId: string
  image?: string
  description?: string
  /** Auction end, as ms offset from page load (resolved to a timestamp in the store). */
  endsIn?: number
  bids?: Bid[]
  category?: string
  /** Real listings from the database: every photo URL, in order. */
  images?: string[]
  /** True for listings stored in Supabase (false for the built-in samples). */
  real?: boolean
  /** draft, pending_review, active, sold, ended or removed. Only set on real listings. */
  status?: string
}

const HOUR = 3_600_000

export const LISTINGS: Listing[] = [
  { id: '1978-fj40-frame-off', title: '1978 FJ40 Frame-Off Restoration', series: 40, type: 'Vehicle', price: 48500, year: 1978, mileage: '61,200 mi', location: 'Boise, ID', delivery: 'Local pickup', sellerId: 'dale', image: 'fj40',
    description: 'Frame-off restoration completed in 2023. Original 2F six, rebuilt by a known Cruiser shop, with a fresh 4-speed and new soft-top bows. Photo binder and receipts included. Inspection welcome by appointment.' },
  { id: '1993-fzj80-manual', title: '1993 FZJ80 Manual Conversion', series: 80, type: 'Vehicle', price: 32900, year: 1993, mileage: '187,400 mi', location: 'Spokane, WA', delivery: 'Local pickup', sellerId: 'marcus', image: 'fzj80',
    description: 'Professionally swapped to an H151 five-speed. Factory front and rear lockers, 2.5" lift, roof rack and dual battery. Head gasket done at 170k. Rust-free frame from an eastern Washington owner.' },
  { id: '1987-fj60-survivor', title: '1987 FJ60 Original Survivor', series: 60, type: 'Vehicle', price: 21000, year: 1987, mileage: '142,900 mi', location: 'Tucson, AZ', delivery: 'Local pickup', sellerId: 'hdc', image: 'fj60',
    description: 'Two-owner Arizona truck with original paint and interior. Never lifted, never modified. Service records back to 1994.' },
  { id: '2003-lx470', title: '2003 UZJ100 Lexus LX470', series: 100, type: 'Vehicle', price: 15800, year: 2003, mileage: '168,000 mi', location: 'Denver, CO', delivery: 'Local pickup', sellerId: 'dale', image: 'lx470',
    description: 'Timing belt and water pump at 160k. AHC converted to OME springs. Clean interior and a straightforward daily-driver Cruiser.' },
  { id: '1966-fj45-troopy', title: '1966 FJ45 Troopy Barn Find', series: 40, type: 'Auction', price: 27400, year: 1966, location: 'Bozeman, MT', delivery: 'Local pickup', sellerId: 'marcus', image: 'fj45', endsIn: 50 * HOUR,
    bids: [{ bidder: 'trailhead_88', amount: 26400 }, { bidder: 'ridge_runner', amount: 27000 }, { bidder: 'fj_fan', amount: 27400 }],
    description: 'Stored in a dry barn since 1989. Rolls, steers and stops. A rare long-wheelbase troop carrier ready for a full restoration.' },
  { id: '2011-lc200', title: '2011 200 Series Land Cruiser', series: 200, type: 'Auction', price: 41200, year: 2011, location: 'Austin, TX', delivery: 'Local pickup', sellerId: 'hdc', image: 'lc200', endsIn: 5 * HOUR,
    bids: [{ bidder: 'hill_country', amount: 40400 }, { bidder: 'trailhead_88', amount: 40800 }, { bidder: 'overland_tx', amount: 41200 }],
    description: 'One-owner, dealer-serviced, 112k miles. Factory KDSS, new BFG KO2s, and a clean CARFAX.' },
  { id: 'fj40-steel-front-bumper', title: 'FJ40 Steel Front Bumper', series: 40, type: 'Parts', price: 420, year: [1960, 1984], location: 'Reno, NV', delivery: 'Ships', shipping: 85, sellerId: 'dale', image: 'bumper', category: 'bumper' },
  { id: '80-front-axle-rebuild-kit', title: '80 Series Front Axle Rebuild Kit', series: 80, type: 'Parts', price: 640, year: [1990, 1997], location: 'Portland, OR', delivery: 'Ships', shipping: 60, sellerId: 'marcus', image: 'axle', category: 'axle' },
  { id: '60-tailgate-assembly', title: '60 Series Tailgate Assembly', series: 60, type: 'Parts', price: 380, year: [1980, 1990], location: 'Mesa, AZ', delivery: 'Ships', shipping: 110, sellerId: 'hdc', image: 'tailgate', category: 'tailgate' },
  { id: '100-rear-arb-locker', title: '100 Series Rear ARB Locker', series: 100, type: 'Parts', price: 1150, year: [1998, 2007], location: 'Salt Lake City, UT', delivery: 'Ships', shipping: 70, sellerId: 'dale', image: 'locker', category: 'locker' },
  { id: '200-roof-rack-system', title: '200 Series Roof Rack System', series: 200, type: 'Parts', price: 560, year: [2008, 2021], location: 'Austin, TX', delivery: 'Ships', shipping: 95, sellerId: 'marcus', image: 'rack', category: 'rack' },
  { id: '70-1hz-diesel-engine', title: '70 Series 1HZ Diesel Engine', series: 70, type: 'Parts', price: 6200, year: [1990, 2007], location: 'Billings, MT', delivery: 'Ships', shipping: 340, sellerId: 'hdc', image: 'engine', category: 'engine' },
]

export const PART_CATEGORIES = [
  { label: 'Armor and bumpers', q: 'bumper' },
  { label: 'Axles and drivetrain', q: 'axle' },
  { label: 'Engines', q: 'engine' },
  { label: 'Body and tailgates', q: 'tailgate' },
  { label: 'Lockers', q: 'locker' },
  { label: 'Racks and lighting', q: 'rack' },
]

export interface WantedPost {
  id: string
  title: string
  series: SeriesId
  budget: string
  region: string
  user: string
}

export const WANTED: WantedPost[] = [
  { id: 'w1', title: '1994 FZJ80, manual, under 200k miles', series: 80, budget: 'Up to $30,000', region: 'Within 500 mi of Seattle', user: 'Chris M.' },
  { id: 'w2', title: 'FJ40 hardtop, original', series: 40, budget: 'Up to $1,200', region: 'Will cover shipping', user: 'Jo A.' },
  { id: 'w3', title: '100 Series factory nav and dash trim', series: 100, budget: 'Any condition', region: 'Verified sellers only', user: 'Sam W.' },
]

export interface Message {
  fromMe: boolean
  text: string
}

export interface Thread {
  id: string
  with: string
  subject: string
  messages: Message[]
}

export const THREADS: Thread[] = [
  { id: 't1', with: 'Dale R.', subject: '1978 FJ40 Frame-Off Restoration', messages: [
    { fromMe: true, text: 'Is the FJ40 still available?' },
    { fromMe: false, text: 'Yes it is. Happy to send more photos of the frame.' },
  ] },
]

/** Marketplace and buyer-protection fee, built into every all-in price. */
export const FEE_RATE = 0.07
/** Bids inside this window extend the auction by the same amount. */
export const SOFT_CLOSE_MS = 120_000
export const MIN_BID_STEP = 100
