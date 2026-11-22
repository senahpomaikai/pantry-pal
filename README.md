# Pantry Pal

A clickable prototype of Pantry Pal, an app for cooking what you already have, built for our IS 551 user tests.

**Open the app:** https://senahpomaikai.github.io/pantry-pal/ lets you pick a version:

- [Version A](https://senahpomaikai.github.io/pantry-pal/A/): control, as tested
- [Version B](https://senahpomaikai.github.io/pantry-pal/B/): impact message, as tested
- [Version 2](https://senahpomaikai.github.io/pantry-pal/v2/): revised after user testing

It works on a phone or a laptop. Nothing a tester does is saved, so refreshing the page starts fresh.

## The versions

| | Link | What's different |
|---|---|---|
| **Version A** (control) | https://senahpomaikai.github.io/pantry-pal/A/ | No impact message |
| **Version B** | https://senahpomaikai.github.io/pantry-pal/B/ | After food is used or a recipe is cooked: "You saved ~$## and ## lbs of food from going to the landfill" |
| **Version 2** (revised) | https://senahpomaikai.github.io/pantry-pal/v2/ | Version B plus the changes from our user-test analysis (below) |

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

## Version 2: changes from user testing

A and B stay live exactly as tested, so they serve as the copy to refer back to. Version 2 is built from the same code with `VITE_VARIANT=v2`; every change is gated by `REVISED` in [`src/variants.ts`](src/variants.ts).

| Change | Whose analysis it came from | Finding |
|---|---|---|
| **"You already have this" warnings** when typing, scanning or importing an item that's already in the pantry | Senah (Prefers_App) | Believing the app prevents duplicate buys was the only significant predictor of preferring Pantry Pal (+22 points, p = .005) |
| **Shopping list that checks the pantry**: type an item at the store to see if it's at home, add a recipe’s missing ingredients in one tap, share it with family, groups or friends | Senah (Prefers_App) | Same; themes 3 and 5 (checking stock from the store, whole-household use) |
| **Savings welcome on Home**: money saved and pounds of food not wasted over a recent period, a fresh figure on each load | Senah (Prefers_App) | Preference rose with believing the app prevents wasted money; the app's goal is less waste and more savings |
| **Cook with several items at once**: pick spinach + chicken (or every expiring item) and get recipes ranked by how many they use; two new recipes combine them | Madison (Use_Before_Expire) | B21 let spinach spoil because no recipe used both; theme 4 |
| **One clear place to add food**: the Add button opens every way in (Scan receipt, Scan barcode, Say it, Type, Shopping list), and the Pantry screen has its own Add button; Home's other actions are grouped as Quick actions | Madison (recordings) | Participants explored the page before finding how to add food |
| **Package sizes you can change**: common sizes as chips (quart / half gallon / gallon) plus a free-text size, on Add, Scan and Receipt | Annabelle (Ease_Track) | Participants were confused by fixed measurements |
| **Less expiration entry**: shelf life fills in from the storage spot with a note on where it came from; a time set by hand can be saved as your default | Annabelle (Ease_Track, Resourceful) | Ease_Track rose with autofill (+1.43, p = .015); manual dates were the main complaint |
| **Add a whole shop at once** from a receipt photo or a store order (e.g. Walmart), with sizes and dates filled in | Karen (Effort_Worth) | Effort_Worth fell (−0.46); about half said manual entry cost more time than it saved; B5 asked for receipts |
| **Say it**: speak a grocery ("two half gallons of Horizon milk, expires Friday") and the app picks out item, brand, amount, size and expiration | Karen (Effort_Worth) | Same; participants asked to speak items instead of typing them |
| **Better recipe discovery**: recipe photos, a step-by-step video, import a recipe from a link | Karen (Ease_Recipe) | Ease_Recipe barely moved (+0.11, p = .87); users asked for images, videos and their own recipes |

The camera, receipt reader, store import, videos and savings figures are pretend, as the scanner was in A and B. Say it uses the browser's speech recognition where it is allowed (Chrome, Safari) and otherwise fills in a sample sentence; the parsing of what was said is real (`parseVoice` in [`src/state/v2.ts`](src/state/v2.ts)).

The step-by-step plan is in [docs/Pantry_Pal_Next_Steps.pdf](docs/Pantry_Pal_Next_Steps.pdf).

---

## For developers

Requires Node 20+.

```sh
npm install
npm run dev          # http://localhost:5173/pantry-pal/ (Version A; VITE_VARIANT=b or VITE_VARIANT=v2 for the others)
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

**Versions:** each is its own build (`scripts/build.mjs`), so a tester can't switch. What differs lives in `VARIANT_CONFIG` in [`src/variants.ts`](src/variants.ts). Version 2's screens are in `src/screens/v2/` and its logic in `src/state/v2.ts`.

**Food data:** `src/state/foods.ts` holds the fixed food table and notes the price and shelf-life source for each food. `src/state/impact.ts` does the savings math.

**Code map:** `src/state/` holds the pure logic (seed data, reducer, selectors). `src/screens/` has one file per screen,
`src/components/` holds shared UI, and `src/styles/prototype.css` is the prototype's stylesheet, copied unchanged.
