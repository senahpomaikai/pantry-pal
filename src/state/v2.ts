// Data and pure logic for the revised build (v2), added after the A/B user tests.
// A and B never call into this file except through state that stays empty for them.
import { SCAN_GROCERIES, daysIn, findFood } from './foods';
import { allRecipes, expLabel, has, match, recipeCard, type RecipeCard } from './selectors';
import type { AppState, PantryItem, ReceiptLine, Recipe } from './types';

/* ---------- recipes ---------- */

/** One recipe that uses spinach and chicken together (participant B21 could not find one). */
export const V2_RECIPES: Recipe[] = [
  { id: 'skillet', title: 'Chicken & Spinach Skillet', time: 30, serves: 3, by: 'Pantry Pal', diet: ['Gluten-free', 'Nut-free'], ings: ['Chicken thighs', 'Spinach', 'Cherry tomatoes', 'Garlic'], amts: [[1, 'lb'], [3, 'cup'], [1, 'cup'], [3, 'clove']], steps: ['Season the chicken and brown it in a hot pan, 5 minutes a side.', 'Add garlic and halved tomatoes and cook until they soften.', 'Stir in the spinach until it wilts.', 'Slice the chicken and serve it over the greens.'] },
  { id: 'wrap', title: 'Chicken, Spinach & Cheddar Wraps', time: 20, serves: 2, by: 'Pantry Pal', diet: ['Nut-free'], ings: ['Chicken thighs', 'Spinach', 'Tortillas', 'Cheddar'], amts: [[0.5, 'lb'], [2, 'cup'], [4, 'whole'], [0.5, 'cup']], steps: ['Cook and slice the chicken.', 'Fill tortillas with chicken, spinach and cheddar.', 'Roll up and toast seam-side down until crisp.'] },
];

/** A short video for each recipe (pretend: the prototype shows a still with a play button). */
export const videoLength = (r: Recipe) => Math.max(1, Math.round(r.steps.length * 0.75)) + ' min video';

/** What the pretend importer reads from a recipe link. */
export function importedRecipe(url: string, id: string): Recipe {
  let site = 'the web';
  try { site = new URL(/^https?:/.test(url) ? url : 'https://' + url).hostname.replace(/^www\./, ''); } catch { /* keep default */ }
  return {
    id, title: 'Garlicky Greens Pasta', time: 25, serves: 2, by: site, diet: ['Vegetarian', 'Nut-free'],
    ings: ['Pasta', 'Spinach', 'Garlic', 'Cheddar'], amts: [[8, 'oz'], [2, 'cup'], [3, 'clove'], [0.5, 'cup']],
    steps: ['Boil the pasta and save a cup of the water.', 'Soften garlic in olive oil, then wilt the spinach.', 'Toss in the pasta, cheese and a splash of the water.'],
  };
}

/* ---------- package sizes ---------- */

const SIZES: Record<string, string[]> = {
  Milk: ['Quart', 'Half gallon', 'Gallon'],
  Yogurt: ['6 oz cup', '16 oz tub', '32 oz tub'],
  Strawberries: ['1 pint', '1 lb', '2 lb'],
  'Ground beef': ['1 lb', '2 lb', '3 lb'],
  Bread: ['Half loaf', '1 loaf', '2 loaves'],
  Eggs: ['6', '1 dozen', '18'],
  Spinach: ['5 oz bag', '1 bag', '10 oz bag'],
  Bananas: ['3', '5', '1 bunch'],
};

/** Size choices for a food: its common packages, or half / usual / double. Always includes the current value. */
export function sizeOptions(name: string, current: string): string[] {
  const food = findFood(name);
  const base = food ? SIZES[food.name] ?? [food.qty] : [];
  const opts = base.slice();
  if (current && !opts.some((o) => o.toLowerCase() === current.toLowerCase())) opts.push(current);
  return opts;
}

/* ---------- saved shelf lives ---------- */

export const daysKey = (name: string, loc: string) => (findFood(name)?.name ?? name.trim()).toLowerCase() + '|' + loc;

/** The shelf life for a food in a place: the tester's own saved one first, then the food table. */
export function shelfLife(st: Pick<AppState, 'savedDays'>, name: string, loc: string): { days: number | null; saved: boolean } {
  const own = st.savedDays[daysKey(name, loc)];
  if (own) return { days: own, saved: true };
  return { days: daysIn(findFood(name), loc), saved: false };
}

/* ---------- duplicates ---------- */

const same = (a: string, b: string) => {
  const fa = findFood(a)?.name, fb = findFood(b)?.name;
  if (fa && fb) return fa === fb;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
};

/** The pantry item a new grocery would duplicate, if any. */
export const duplicateOf = (pantry: PantryItem[], name: string) => (name.trim() ? pantry.find((p) => same(p.name, name)) : undefined);

export const dupLine = (p: PantryItem) =>
  'Already have: ' + [p.qty, p.loc, expLabel(p.days)].filter(Boolean).join(' · ');

/* ---------- receipt / store import ---------- */

const RECEIPT_EXTRA = ['Eggs'];

/** The lines on the pretend receipt: the Task 1 groceries plus eggs, which are already in the pantry. */
export function receiptLines(st: Pick<AppState, 'savedDays' | 'pantry'>): ReceiptLine[] {
  return SCAN_GROCERIES.concat(RECEIPT_EXTRA).map((n) => {
    const food = findFood(n)!;
    return { name: food.name, qty: food.qty, loc: food.loc, days: shelfLife(st, food.name, food.loc).days ?? 5, on: true };
  });
}

/* ---------- cook with several items ---------- */

export interface ComboCard extends RecipeCard { uses: string[]; usesAll: boolean }

/** Recipes ranked by how many of the picked items they use, then by how much of the rest is on hand. */
export function comboRecipes(st: Pick<AppState, 'pantry' | 'pick' | 'mine' | 'bonus'>): ComboCard[] {
  const picked = st.pantry.filter((p) => st.pick.includes(p.id));
  if (!picked.length) return [];
  return allRecipes(st)
    .map((r) => {
      const uses = picked.filter((p) => r.ings.some((i) => match(i, p.name))).map((p) => p.name);
      return { ...recipeCard(st.pantry, r), uses, usesAll: uses.length === picked.length };
    })
    .filter((c) => c.uses.length > 0)
    .sort((a, b) => b.uses.length - a.uses.length || b.have / b.total - a.have / a.total);
}

/* ---------- shopping list ---------- */

/** Ingredients of a recipe that are not in the pantry. */
export const missingFor = (pantry: PantryItem[], r: Recipe) => r.ings.filter((i) => !has(pantry, i));
