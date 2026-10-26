# Pantry Pal

A clickable prototype of Pantry Pal, an app for cooking what you already have, built for our IS 551 user tests.

**Open the app:** https://senahpomaikai.github.io/pantry-pal/

It works on a phone or a laptop. Nothing a tester does is saved, so refreshing the page starts fresh.

## The two versions (A/B test)

The versions differ only in **how you add groceries**:

| | Link | How you add groceries |
|---|---|---|
| **Version A** | https://senahpomaikai.github.io/pantry-pal/?v=a | A big round **+** button in the middle of the bottom bar |
| **Version B** | https://senahpomaikai.github.io/pantry-pal/?v=b | No + button. An **Add** button at the top of the Pantry page |

When UXtweak shows the task instructions itself, add `&task=0` to the end of the link so testers don't see them twice.

The step-by-step plan is in [docs/Pantry_Pal_Next_Steps.pdf](docs/Pantry_Pal_Next_Steps.pdf).

---

## For developers

Requires Node 20+.

```sh
npm install
npm run dev          # http://localhost:5173/pantry-pal/
npm test             # unit tests
npm run e2e          # Playwright (build first; `npx playwright install chromium` once)
npm run screenshots  # 390x844 @2x PNGs for UXtweak image tests → screenshots/{a,b}/
```

Pushing to `main` deploys to GitHub Pages in about a minute. CI runs typecheck, lint, unit tests, build and e2e.
**Don't push to `main` on testing days**, so every tester sees the same app.

**Query parameters**

| Param | Values | Effect |
|---|---|---|
| `v` | `a` (default), `b` | Version. Remembered for the browser tab, so a refresh keeps it. |
| `task` | `0` | Hide the test-task layer (top strip, welcome, tour, task sheet, completion modal) |
| `intro` | `0` | Skip only the welcome notice and tour |
| `frame` | `0` | No phone frame on desktop |
| `screen` | `home` `pantry` `recipes` `me` `scan` `scanresult` `add` `recipe` `cook` `share` | Open straight to a screen. `recipe`/`cook`/`share` take `id=` (default `frittata`) |

**Changing version B:** edit the `b` row of `VARIANT_CONFIG` in [`src/variants.ts`](src/variants.ts)
(`addTab`, `pantryAddButton`, `addSheetRecipes`). Then update the variant B test in `e2e/test-task.spec.ts`.

**Code map:** `src/state/` holds the pure logic (seed data, reducer, selectors). `src/screens/` has one file per screen,
`src/components/` holds shared UI, and `src/styles/prototype.css` is the prototype's stylesheet, copied unchanged.
