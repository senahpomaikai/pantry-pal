# Parity with `design-source/Main.dc.html`

Every screen and interaction in the prototype, checked against this port.
✅ = done (same copy, markup classes, seed data and behavior) · ⚠️ = diverged (note says how and why).
Variant A is the reference. Variant B differences are listed separately in [AB_VARIANTS.md](AB_VARIANTS.md).

How we checked: the CSS is a verbatim copy (`src/styles/prototype.css`, lines 13–137 of the source); copy strings were
ported by hand from the markup; behavior is covered by `src/state/*.test.ts` (58 unit tests) and `e2e/` (both variants
complete the test task).

## Prototype chrome (test-task layer)

| Item | Status | Note |
|---|---|---|
| Top strip: "lo-fi prototype" stamp → About this prototype | ✅ | |
| Top strip: "Test task: N of 3" → task sheet | ✅ | Count from the same `task()` (g1 spinach in pantry, g2 spinach recipe saved, g3 spinach recipe shared). |
| Welcome notice ("Welcome! This is a rough draft.") with Show me around first / Skip | ✅ | |
| Tour: 3 slides, dots, Skip, Next / "Start using Pantry Pal" | ✅ | Sits under the strip (`top:44px`); at `top:0` when `?task=0` hides the strip. |
| Task sheet: 3 rows with checks, hints, "There is more than one way…", Got it, overlay tap closes | ✅ | |
| Task-complete modal, shown once at 3 of 3, "Keep exploring" | ✅ | `componentDidUpdate` replaced by a `useEffect` in `src/store.tsx`. |
| Toasts (2.6 s, a new toast restarts the timer) | ✅ | All toast strings identical. |
| `?task=0` / `?intro=0` | ⚠️ | New (brief §6). With `task=0` the "Show my test task" button on About is hidden (there is no task sheet to open). "Replay the intro" still works. |

## Screens

| Screen | Status | Note |
|---|---|---|
| Home: logo, notifications bell with badge count, Scan groceries, Use these soon (h-scroll), goal row, You can cook now (top 3), See all links | ✅ | |
| My pantry: count, Filters accordion (Where incl. custom places, Expires), badge + `aria-expanded`/`aria-controls`, summary + Clear, rows sorted by days, Nothing matches / Nothing here yet | ✅ | |
| Pantry item: photo, expiry ("Expires tomorrow" / "Good for 5 days"), I used it / I tossed it, Recipes with X, No recipes yet → Write a recipe | ✅ | |
| Scan: camera placeholder, Pretend to scan: baby spinach, Type it in instead, close | ✅ | |
| Scan result ("We found"): place chips, Custom place, Good for about chips, Custom time, Add to my pantry, Scan again | ✅ | |
| Add an item: name, Try quick picks, quantity, place, days, disabled Add + "Add a name to continue" | ✅ | |
| Custom place form: 20-char limit and counter, "Type a name for the place.", "Use 20 characters or fewer.", "Use letters, numbers and spaces only.", "“X” is already on the list." | ✅ | Unit-tested. |
| Custom time form: Days/Weeks/Months, "Enter a whole number from 1 to 365 days." (52 weeks, 12 months) | ✅ | Unit-tested. |
| Recipes: Discover / Saved / Mine, search, Filters accordion (4 chips), "No food preferences saved. Set them", Clear filters (disabled when none), Write a new recipe (Mine), empty states | ✅ | |
| Recipe detail: save (bookmark fills), share, haveLine, Start cooking, ingredients with in pantry / use soon / need to buy, steps | ✅ | |
| Cook mode: Step N of M, progress bar, Back (disabled on step 1), Next step / I’m done cooking | ✅ | |
| Use-up ("Nice cooking!"): pre-checked items, toggle, Update my pantry, Skip, "None of these are in your pantry." | ✅ | |
| New recipe, step 1 (Basics): name, photo ("Photos are not part of this prototype yet"), time chips, serves stepper 1–12, "Name your recipe to continue" | ✅ | |
| New recipe, step 2 (Ingredients): pantry chips, Something else? + Add, amount/unit grid, remove, "Enter an amount above 0, up to 999.", "Pick at least one ingredient", "Fix the amounts above to continue" | ✅ | |
| New recipe, step 3 (Steps): numbered steps, remove, Add step, "Add at least one step" | ✅ | |
| New recipe, step 4 (Review): summary card, Save to my recipes → recipe page, Go back and edit; Cancel exits; Back steps down | ✅ | |
| Shared with me: friends' recipes, You shared list with "sent" tags | ✅ | |
| Notifications: expiring items (expires tomorrow / in N days), "Maya shared a recipe", Reminder settings | ✅ | |
| Me: stats (used up / cooked / saved), menu rows, "counts are from this session only" | ✅ | |
| My goals: goal cards with progress bar (`role=progressbar`), Done tag, Remove; Add a goal presets; "Already on your list", "Nothing is expiring soon right now", "Goal added" | ✅ | |
| Expiry reminders: two switches, How early? chips | ✅ | |
| Food preferences: 5 chips, Save preferences → back + toast | ✅ | |
| About this prototype | ✅ | See `?task=0` note above. |
| Tab bar: active tab by screen group, hidden on scan/cook/create/use-up | ✅ | Variant A. |
| Add sheet: Scan an item / Type it in / Write a recipe; overlay tap closes | ✅ | Variant A. |
| Share sheet: 4 friends, Send to N friend(s) / "Pick someone to send to" (disabled), Copy link instead, toasts | ✅ | |

## Navigation

| Item | Status | Note |
|---|---|---|
| `go` pushes a back stack; Back pops it; tabs clear it | ✅ | Unit-tested. |
| Back inside New recipe steps down before leaving | ✅ | |
| After adding an item → My pantry with filters reset and the stack cleared | ✅ | |
| After saving a recipe → its page, Back → Recipes (Mine) | ✅ | |
| `?screen=` deep links | ⚠️ | New (brief §6). Seed a plausible back stack (e.g. recipe → Back → Recipes). Adds `scanresult`, which the brief's screenshot list needs. |

## Accessibility and web additions (all diverge on purpose)

| Item | Status | Note |
|---|---|---|
| 44px targets, `aria-label`s, `aria-pressed` on chips/toggles, `aria-expanded`/`aria-controls` on accordions, `role=alert` on errors, `role=status` on toasts | ✅ | Kept from the source. |
| `:focus-visible` outlines | ⚠️ | Added: 2.5px emerald (#1D3B28), cream on the dark scan screen. |
| Hover/press states | ⚠️ | Added for mouse users only (`@media (hover:hover) and (pointer:fine)`). Touch looks unchanged. |
| Sheets get `role=dialog` + `aria-modal` + `aria-label`; buttons that open them get `aria-haspopup`; active tab gets `aria-current="page"`; the onboarding overlay is a labelled dialog | ⚠️ | Added for screen readers. No visual change. |
| `aria-live` on the cook-mode step text and the serves count | ⚠️ | Added. No visual change. |
| `inputMode` on number fields | ⚠️ | Added so phones show a number pad. |
| Layout: 390×844 fixed artboard | ⚠️ | Phones: full-bleed `100dvh` with safe-area insets. Desktop: 390×844 frame scaled to fit the window. `?frame=0` fills the window. |
| Font stack | ⚠️ | Same Figtree/Caveat via Google Fonts (`display=swap`), with Roboto/Helvetica/Arial added to the system fallback. |
| Sheet header row | ⚠️ | The Add and task sheets now share the share sheet's header (`gap:8px`). No visible difference. |
| State is in-memory only | ✅ | Only the A/B variant is kept in `sessionStorage`, which the brief requires. |
