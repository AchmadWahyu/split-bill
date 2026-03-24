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

## Project layout (high level)

- `src/routes/` — page components and route-specific folders (`add-expense/`, `event-result/`) for composition-friendly context + views
- `src/components/` — shared UI and layout helpers
- `tests/` — Playwright specs

## Lucide icons (bundle size)

Icons are imported from per-icon paths under `lucide-react/dist/esm/icons/…` instead of the package barrel. Ambient types live in `src/types/lucide-react-icons.d.ts`.

## Context + `use()` (React 19)

Some routes expose shared state via `createContext` and consume it with `use()` (see `src/routes/add-expense/addExpenseContext.tsx` and `src/routes/event-result/eventResultContext.tsx`). This avoids deep prop drilling while keeping providers as the single place that knows how state is produced.
