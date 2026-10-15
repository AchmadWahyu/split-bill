# Split Bareng (split-bill)

Patungan jadi gampang, cepet, dan adil — a small Vite + React app for splitting bills with friends.

## Prerequisites

- Node.js 20+ (recommended)
- npm
- Playwright browsers (once per machine, after `npm install`): `npx playwright install`

## Scripts

| Command | Description |
| -------- | ----------- |
| `npm run dev` | Start the Vite dev server (default port 5173) |
| `npm run dev:wrangler` | Build and start local Cloudflare Pages dev server with Functions (serves `/api/*`) |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run Playwright end-to-end tests (starts dev server via config) |
| `npm run test:e2e:ui` | Playwright with interactive UI |

### End-to-end tests

Playwright is configured in `playwright.config.ts` with `baseURL` `http://localhost:5173` and a `webServer` hook that runs `npm run dev` before tests (unless you already have a server running).

```bash
npm run test:e2e
```

To debug a single file:

```bash
npx playwright test tests/verify-makan-malam-flow.spec.ts
```

## Local development with Cloudflare Functions (BFF)

The `/api/*` routes are Cloudflare Pages Functions, not Vite endpoints. Plain `npm run dev` only starts the Vite dev server, so calls to `/api/scan-receipt` will return 404.

To run the app + Functions locally:

1. Make sure `.dev.vars` exists in the project root and contains your keys:

   ```env
   GEMINI_API_KEY=...
   MISTRAL_API_KEY=...
   ```

2. Run the wrangler dev command:

   ```bash
   npm run dev:wrangler
   ```

   This builds the app and starts `wrangler pages dev`, which serves the static build and the Functions.

3. Open the URL shown by wrangler (default `http://localhost:8788`) and test the receipt scan flow.

> The Vite dev server on port 5173 is **not** used by `dev:wrangler`. If you need hot-reload while editing React code, run `npm run dev` in one terminal and `npx wrangler pages dev` in another, then proxy `/api/*` from Vite to wrangler.

## Project layout (high level)

- `src/routes/` — page components and route-specific folders (`add-expense/`, `event-result/`) for composition-friendly context + views
- `src/components/` — shared UI and layout helpers
- `tests/` — Playwright specs

## Lucide icons (bundle size)

Icons are imported from per-icon paths under `lucide-react/dist/esm/icons/…` instead of the package barrel. Ambient types live in `src/types/lucide-react-icons.d.ts`.

## Context + `use()` (React 19)

Some routes expose shared state via `createContext` and consume it with `use()` (see `src/routes/add-expense/addExpenseContext.tsx` and `src/routes/event-result/eventResultContext.tsx`). This avoids deep prop drilling while keeping providers as the single place that knows how state is produced.
