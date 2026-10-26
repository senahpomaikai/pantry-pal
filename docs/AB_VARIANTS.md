# A/B variants

Variants live behind the `v` query parameter on `main`, not in branches. Every difference is driven by one
table, `VARIANT_CONFIG` in [`src/variants.ts`](../src/variants.ts).

| | Variant A (`?v=a`, default) | Variant B (`?v=b`, candidate) |
|---|---|---|
| Tab bar | Home · Pantry · **+ Add** · Recipes · Me | Home · Pantry · Recipes · Me |
| Home | "Scan groceries" primary button | same |
| My pantry header | Filters | **+ Add** and Filters |
| Add sheet | Groceries (Scan an item, Type it in) + Recipes (Write a recipe) | Groceries only (Scan an item, Type it in) |
| `?screen=add` screenshot | sheet over Home | sheet over My pantry |

Variant A is the prototype exactly as designed. Variant B is the team's default candidate and can be changed.

## What we are testing

The first step of the core task: **getting a grocery item into the pantry**.

**Hypothesis.** Participants will start the "add spinach" step faster and with fewer wrong first clicks when the add
action sits in context, in the pantry (B), than when it sits behind a generic centre "+" tab (A). The "Scan
groceries" button on Home is in both variants, so B removes one entry point but does not hide adding from Home.

**Counter-hypothesis.** The centre "+" is a familiar mobile pattern. Removing it may send people hunting, which would
show up as a longer time to the first add in B.

## What to measure

| Metric | Definition | Tool |
|---|---|---|
| Task success | Spinach is in the pantry (the strip reads "Test task: 1 of 3" or more); full success = the completion modal | UXtweak website test (moderated pilots: observer notes) |
| First click | Where participants first tap when asked to "add the spinach you just bought" | UXtweak First Click on `screenshots/{a,b}/01-home.png` and `02-pantry.png` |
| Time to first add | Seconds from the task start to the "… added to your pantry" toast | UXtweak website test timing, or eye-tracking recording timestamps |
| Path used | Scan groceries (Home) / + tab (A) / pantry Add (B) / See all → pantry | Observation, eye-tracking replay |
| Confidence | Single Ease Question (1–7) after the step | UXtweak questionnaire |

Suggested design: between-subjects, so each participant sees only one variant. Assign alternately and record the variant in
[TEST_LOG.md](TEST_LOG.md). With small n, report medians and individual paths, not significance tests.

UXtweak's Preference test can show `screenshots/a/01-home.png` next to `screenshots/b/01-home.png` (and the
`02-pantry` pair) with the question "Where would you tap to add groceries?"

## How to change variant B

1. Open [`src/variants.ts`](../src/variants.ts) and edit the `b` row of `VARIANT_CONFIG`:
   ```ts
   b: { addTab: false, pantryAddButton: true, addSheetRecipes: false, addSheetOver: 'pantry' },
   ```
   - `addTab`: show the centre "+" tab.
   - `pantryAddButton`: show "+ Add" in the My pantry header.
   - `addSheetRecipes`: show the "Recipes › Write a recipe" group in the Add sheet.
   - `addSheetOver`: which screen `?screen=add` opens the sheet over (for screenshots).
2. For a new kind of difference, add a field to `VariantConfig`, read it with `useVariantConfig()` in the component
   that changes, and give A the prototype's behavior. The places that read it today:
   [`TabBar.tsx`](../src/components/TabBar.tsx), [`Pantry.tsx`](../src/screens/Pantry.tsx) (`PantryAddButton`),
   [`AddSheet.tsx`](../src/components/AddSheet.tsx). Variant-only CSS can key off `.app[data-variant="b"]`
   or `html[data-variant="b"]`.
3. Update the table above, the variant B e2e test in [`e2e/test-task.spec.ts`](../e2e/test-task.spec.ts), and run
   `npm run screenshots`.
4. Open a PR (`feat/variant-b-<idea>`) and tag the build before the next test round.

**Open decision for the team:** in B, should the pantry Add sheet keep "Write a recipe"? We dropped it because the brief
says "the same two options". Writing a recipe stays reachable from Recipes › Mine (and from an item's page when no recipe uses that item).
