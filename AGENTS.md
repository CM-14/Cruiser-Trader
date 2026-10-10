# AGENTS.md

Cruiser Trader is a Land Cruiser marketplace built with TanStack Start, React 19 and Tailwind 4. **Continue from [PLAN.md](PLAN.md).**

## Layout
- `src/data/fixtures.ts`: all stub data (series, listings, sellers, wanted posts, threads). Later milestones replace this module with real persistence.
- `src/lib/store.tsx`: in-memory app state via React context (`useStore`). The rig and verified flag persist to localStorage. Also contains `useNow`, a clock that is safe during SSR.
- `src/lib/format.ts`: pricing (all-in = price + shipping + 7% fee), fitment and countdown helpers, plus `img()` for Netlify Image CDN URLs.
- `src/lib/search.ts`: `validateSearch` functions for the routes.
- `src/components/`: header (mega menu), footer, cards, dialogs, `Browse` (the shared filter grid), and `TrailSection` (scroll animation).
- `src/routes/`: file-based routes. `/vehicles`, `/parts`, `/auctions` and `/shop` all render `Browse`.
- `public/img/*.jpg`: AI-generated listing photos. Always reference them through `img(key, w, h)`.

## Conventions
- Design tokens are CSS variables in `styles.css`, exposed as Tailwind colors (`paper`, `ink`, `forest`, `rust`, `sand` and others). Components use the `.btn`, `.field`, `.panel`, `.display` and `.eyebrow` classes.
- Use the `@/` import alias and strict TypeScript.
