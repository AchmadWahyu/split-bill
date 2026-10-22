# Agent Rules — Split Bareng

## End-to-end tests (Playwright)

### Tech & entry points
- Framework: **Playwright** with TypeScript (ESM, `type: "module"`).
- Run all e2e tests: `npm run test:e2e`.
- Run one spec: `npx playwright test tests/<path>.spec.ts`.
- Playwright already starts the Vite dev server via `webServer` in `playwright.config.ts`; do not start the server manually in tests.

### File layout
- Specs live in `tests/`.
- Reusable helpers live in `tests/helpers/`.
- Static mock data for `localStorage` seeding lives in `src/mocks/localStorage/`.
- Screenshots go to `screenshots-captured/` (create with `mkdirSync(..., { recursive: true })` if needed).

### Test structure
- Wrap specs in `test.describe('...', () => { ... })`.
- Use `test.beforeEach` for shared setup (clearing/seeding `localStorage`, setting viewport, suppressing coachmarks).
- Use `test.setTimeout(...)` only for unusually long flows (default is usually enough).

### Selectors
- Prefer `data-testid` and semantic role selectors (`getByRole`, `getByPlaceholder`, `getByText`).
- Avoid brittle XPath or deep CSS chains.
- For receipt cards, use `[data-testid="receipt-card"][data-receipt-name="..."]`.
- For person toggle buttons, use the initials rendered in the UI (e.g. `getByRole('button', { name: 'JO' })`).

### State setup
- Seed `localStorage` directly with `page.evaluate` instead of clicking through the UI when testing read-only/result flows:
  ```ts
  await page.evaluate((data) => {
    localStorage.setItem('eventList', JSON.stringify(data));
  }, mockData);
  ```
- For flows that create events through the UI, use a **unique `EVENT_ID`** per spec to avoid collisions in `localStorage`:
  ```ts
  const EVENT_ID = 'unique-flow-test-id';
  await page.goto(`/acara/${EVENT_ID}/edit`);
  ```
- Suppress the add-member coachmark before interacting with member buttons:
  ```ts
  import { suppressAddMemberCoachmark } from '../helpers/multi-receipt';
  await suppressAddMemberCoachmark(page);
  ```

### Waiting
- Avoid `page.waitForTimeout(...)` for synchronization. Use explicit waits:
  - `await page.waitForURL(/.../)`
  - `await expect(...).toBeVisible()`
  - `await page.getByText(...).waitFor()`
- Tiny delays (`80–150ms`) are only acceptable after animations (coachmark, dialog close, toggle state).

### Viewport
- Default mobile viewport for flow tests:
  ```ts
  await page.setViewportSize({ width: 390, height: 900 });
  ```

### Receipt scan mocking
- Do not call the real `/api/scan-receipt` endpoint in tests. Use the helper from `tests/helpers/multi-receipt.ts`:
  ```ts
  import { createScanMock, uploadImageAndConfirm, waitForScanPage } from '../helpers/multi-receipt';

  const scanMock = createScanMock(page);
  await scanMock.install();
  scanMock.setResponse({ title: '...', personList: [], expense: { ... } }, 200);
  ```

### Person & item helpers
- Add members via `addPerson(page, name)` helper.
- Assign people to items via `assignPersonToItemInReceipt(page, receiptName, itemIndex, initials)`.
- Get initials from a name with `getPersonInitials(name)`.
- Save the event via `saveEvent(page)` helper (clicks the **"Bagi Tagihan"** submit button).
- Prefer helpers over hardcoding button labels, so copy changes only need updating in one place.

### Result-page assertions
- Use `expectResultPageForEvent(page, event)` from `tests/helpers/resultAssertions.ts` to verify totals, member count, item count, and per-person amounts.
- This helper computes expected values from the same `calculatePersonShares`/`calculateTotalFromShares` logic used by the app, so calculations stay in sync.
- Expand a person card with `expandPersonCard(page, name)` before asserting item breakdowns.

### Calculation tests
- Do not hardcode expected split amounts in assertions. Derive them from the shared utility functions or use `expectResultPageForEvent`.
- When testing a new split scenario, add a JSON fixture under `src/mocks/localStorage/<category>/` and a spec that seeds it and calls `expectResultPageForEvent`.

### Naming conventions
- Flow specs: `verify-<feature>-flow.spec.ts` or `<feature>-flow.spec.ts`.
- Calculation matrix specs: `<payer-type>-multiple-person-<modifiers>.spec.ts` (e.g. `single-payer-multiple-person-with-tax.spec.ts`).
- Fixture files: match the spec name and live under `src/mocks/localStorage/<category>/`.
