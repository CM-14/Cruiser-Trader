# Cruiser Trader roadmap

1. **Product surface (done)**: Rebuilt the prototype in React/TanStack Start with a new design system, AI-generated listing photos, and every screen working: home, browse (vehicles/parts/auctions/all), listing detail, sell, wanted, garage, messages, series guide, info pages. Data comes from stubs in `src/data/fixtures.ts`, and app state lives in `src/lib/store.tsx`.
2. **Data model**: Move listings, wanted posts, threads and bids into Netlify Database (Drizzle, `db/schema.ts`) and load them through server functions.
3. **Accounts and verification**: Netlify Identity for sign-in, plus a verification flag and an ID upload stored in Netlify Blobs.
4. **Selling**: Persist new listings and upload photos to Blobs.
5. **Auctions**: Validate bids on the server, apply soft close on the server, and keep countdowns live.
6. **Messaging**: Persist threads and notify the other party.
7. **Payments**: Stripe checkout for Buy now and accepted offers.
