# Cruiser Trader roadmap

Backend: **Supabase** (database, accounts, photo storage, realtime chat). Hosting: Netlify. Do NOT use Netlify Database, Drizzle, Netlify Identity or Netlify Blobs.
The Supabase schema already exists (profiles, listings, listing_photos, listing_fitment, garage_vehicles, wanted_posts, conversations, messages, verification_requests and more, with row level security). Do not alter tables or policies from app code. Never put the Supabase secret / service_role key in browser code.

1. **Product surface (done)**: React / TanStack Start prototype, every screen working on stub data in `src/data/fixtures.ts`.
2. **Accounts (done, this milestone)**: Supabase email + password sign-up and sign-in, profile page at `/account`, trust level panel. Public settings: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. **Listings and photos**: read/write `listings`, `listing_photos`, `listing_fitment`; upload to the `listing-photos` bucket.
4. **Garage, browse and search**: `garage_vehicles`, fitment-aware filters.
5. **Chat and Wanted**: `start_conversation`, `respond_to_offer`, `mark_conversation_read`, realtime on `messages`; `wanted_posts`.
6. **ID verification and vehicle verification**: Stripe Identity or Persona via a server function that sets `id_verified`; verification submission screens; admin review queue.
7. **Auctions**: server-side bidding and soft close.
8. **Payments**: third-party checkout; escrow for vehicles.
