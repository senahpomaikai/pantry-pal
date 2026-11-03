# Pantry Pal

A clickable prototype of Pantry Pal, an app for cooking what you already have, built for our IS 551 user tests.

**Open the app:** https://senahpomaikai.github.io/pantry-pal/ lets you pick a version.

It works on a phone or a laptop. Nothing a tester does is saved, so refreshing the page starts fresh.

## The two versions (A/B test)

| | Link | What's different |
|---|---|---|
| **Version A** (control) | https://senahpomaikai.github.io/pantry-pal/A/ | No impact message |
| **Version B** | https://senahpomaikai.github.io/pantry-pal/B/ | After food is used or a recipe is cooked: "You saved ~$## and ## lbs of food from going to the landfill" |

Give each tester a direct `/A/` or `/B/` link. The capital letter matters.

The message appears after **Update my pantry** following a cooked recipe, or **I used it** on one item. It counts only food expiring within 3 days. Everything else is the same in both versions.

**Task tracking for UXtweak:** the address changes as a tester moves through the tasks, with no reload and nothing shown on screen. Set each task's success condition to "URL contains" the value below.

| Address ends in | When |
|---|---|
| `/B/` (no `task`) | Welcome screen |
| `?task=1-1` | After **Go to my pantry** |
| `?task=1-2` | Once milk, yogurt, strawberries, ground beef and bread are all in the pantry |
| `?task=2` | After cooking a recipe and tapping **Update my pantry** with the spinach ticked |

It only moves forward, and works the same in both versions. Logic: [`src/state/task.ts`](src/state/task.ts).

The step-by-step plan is in [docs/Pantry_Pal_Next_Steps.pdf](docs/Pantry_Pal_Next_Steps.pdf).

---

## For developers

Requires Node 20+.

```sh
npm install
npm run dev          # http://localhost:5173/pantry-pal/ (Version A; VITE_VARIANT=b npm run dev for B)
npm test             # unit tests
npm run e2e          # Playwright (build first; `npx playwright install chromium` once)
npm run screenshots  # 390x844 @2x PNGs for UXtweak image tests → screenshots/{A,B}/
```

Pushing to `main` deploys to GitHub Pages in about a minute. CI runs typecheck, lint, unit tests, build and e2e.
**Don't push to `main` on testing days**, so every tester sees the same app.

**Query parameters**

| Param | Values | Effect |
|---|---|---|
| `intro` | `0` | Skip the welcome screen and household setup |
| `frame` | `0` | No phone frame on desktop |
| `screen` | `home` `pantry` `recipes` `me` `scan` `scanresult` `add` `recipe` `cook` `share` | Open straight to a screen. `recipe`/`cook`/`share` take `id=` (default `frittata`) |
| `task` | set by the app | Test progress for UXtweak (see above). Ignored on load. If UXtweak misses the changes, switch `HISTORY_METHOD` in [`src/store.tsx`](src/store.tsx) to `pushState` |

**Versions:** each is its own build (`scripts/build.mjs`), so a tester can't switch. What differs lives in `VARIANT_CONFIG` in [`src/variants.ts`](src/variants.ts).

**Food data:** `src/state/foods.ts` holds the fixed food table and notes the price and shelf-life source for each food. `src/state/impact.ts` does the savings math.

**Code map:** `src/state/` holds the pure logic (seed data, reducer, selectors). `src/screens/` has one file per screen,
`src/components/` holds shared UI, and `src/styles/prototype.css` is the prototype's stylesheet, copied unchanged.
