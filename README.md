# Pantry Pal: lo-fi prototype (web)

Pantry Pal is a food-waste and recipe app: *cook what you already have*. This repo is the BYU IS 551 team's
**user-testing build**, a mobile-first web port of the lo-fi prototype in [`design-source/Main.dc.html`](design-source/Main.dc.html).
Testers need only a URL. It runs in UXtweak and on a laptop for eye tracking.

- **Live (main):** https://senahpomaikai.github.io/pantry-pal/
- **Frozen test-round builds:** `https://senahpomaikai.github.io/pantry-pal/r/<tag>/` (see [docs/DEPLOY.md](docs/DEPLOY.md))

Nothing is stored. Refreshing the page starts a fresh session, as the prototype promises.

## Run it

Requires Node 20+.

```sh
npm install
npm run dev          # dev server at http://localhost:5173/pantry-pal/
npm run build        # typecheck + production build into dist/
npm test             # unit tests (Vitest)
npm run e2e          # end-to-end tests (Playwright; run `npx playwright install chromium` once, and build first)
npm run lint
npm run screenshots  # build, then save 390x844 @2x PNGs to screenshots/{a,b}/ for UXtweak image tests
```

## Query parameters

Read once on page load. Combine freely, e.g. `?v=b&task=0&screen=pantry`.

| Param | Values | Behavior |
|---|---|---|
| `v` | `a` (default), `b` | A/B variant ([docs/AB_VARIANTS.md](docs/AB_VARIANTS.md)). Sets `data-variant` on `<html>`. Remembered for the browser tab's session, so a refresh keeps it. |
| `task` | `1` (default), `0` | `0` hides the test-task layer: top strip, welcome notice, tour, task sheet, completion modal. Use when UXtweak supplies the task text. |
| `intro` | `1` (default), `0` | `0` skips the welcome notice and tour only. |
| `frame` | `1` (default), `0` | `0` turns off the desktop phone frame (the app fills the window). |
| `screen` | `home`, `pantry`, `recipes`, `me`, `scan`, `scanresult`, `add`, `recipe`, `cook`, `share` | Deep link with seed data. `recipe`, `cook` and `share` use `id=frittata` unless you pass another `id` (`quesadilla`, `chickenrice`, `friedrice`, `pasta`, `smoothie`, `orzo`, `tacos`). `add` opens the Add sheet over Home (A) or My pantry (B). |
| `id` | recipe id | Used with `screen=recipe|cook|share`. |

Typical UXtweak website-test URL: `https://senahpomaikai.github.io/pantry-pal/r/test-r1-pilot1/?v=a&task=0`

## Layout

- Phones (viewport ≤ 480px wide): full-bleed app, `100dvh`, respects safe-area insets.
- Laptops and desktops: a 390×844 phone frame centred on a warm-gray backdrop, scaled to fit the window height
  (fully visible on a 768px-tall laptop, no page scrollbars), which works well for eye tracking.

## Code map

```
src/state/      types, seed data, reducer, selectors, deep links: pure TS, no React/DOM (React Native-ready)
src/store.tsx   useReducer + context, task-complete and toast effects
src/variants.ts query-param flags + VARIANT_CONFIG (everything that differs between A and B)
src/screens/    one file per screen
src/components/ shared UI (tab bar, sheets, chips, chrome, phone frame…)
src/styles/     prototype.css (verbatim from the prototype), tokens.css, app.css (web-only layout/states)
e2e/            Playwright tests (the test task in both variants)
scripts/        screenshots.ts
design-source/  the original prototype (read-only reference, never edited)
docs/           assignment PDFs, PARITY, AB_VARIANTS, BRANCHING, TEST_LOG, DEPLOY
```

## Contributing

Read [docs/BRANCHING.md](docs/BRANCHING.md). Short-lived branches, PRs into `main`, CI must be green.
When you change behavior, update [docs/PARITY.md](docs/PARITY.md).
