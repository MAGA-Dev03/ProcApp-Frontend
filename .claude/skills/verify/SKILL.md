---
name: verify
description: Build/launch/drive recipe for this Vite + React + MUI app (ProcApp-Frontend), a browser GUI.
---

# Verifying ProcApp-Frontend

This is a Vite + React + TypeScript + MUI SPA. No backend — all data comes from
mock JSON in `src/mocks/` via React Query hooks in `src/services/`.

## Build & launch

```bash
npm run build          # tsc -b && vite build
npm run dev             # starts Vite dev server, default port 5173 (bumps if busy)
```

Dev server prints the actual port — check the log, don't assume 5173.

## Driving it (no browser tool in this environment)

No Playwright/browser tool is registered in the harness. Playwright is
installed as a project devDependency (`npm install -D playwright` +
`npx playwright install chromium` — already done once; ~185MB download,
cache persists at `~/AppData/Local/ms-playwright`). Drive it with a throwaway
Node script:

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5173/login');
  // ... interact ...
  await page.screenshot({ path: 'out.png', fullPage: true });
  await browser.close();
})();
```

Run with plain `node script.js` (CommonJS `require` works fine even though
the app itself is ESM/Vite — it's a separate script, not part of the bundle).
Screenshot files can be read directly with the Read tool.

## Key flows worth driving

- Login (`/login`) → submits with any values, no real auth, navigates to `/dashboard`.
- Role switcher in the top bar changes which sidebar nav items are visible
  (Requester/Approver/Finance — see `src/app/nav.ts` for the role→item map).
- RFQ list (`/rfq`) — sortable columns, status/project filters, empty states.
- RFQ detail (`/rfq/:id`) — line items, supplier responses, "Send RFQ" button
  only shows for `draft` status and flips it to `sent` via `useUpdateRfq`.
- RFQ create (`/rfq/new`) — dynamic line-item rows, supplier multi-select,
  submits to an in-memory mock repository (`src/services/shared/createMockRepository.ts`)
  that simulates 300-600ms latency — loading spinners are real, not instant.

## Gotchas

- All mutations are in-memory only (mock repositories) — a full page reload
  resets everything to the seed JSON. Don't expect creates/updates to survive
  a `page.reload()`.
- MUI Select/Autocomplete need `page.locator(...).click()` then pick the
  option from the popup listbox, not `page.selectOption` (that's native
  `<select>` only, and MUI Select is not a native select element).
