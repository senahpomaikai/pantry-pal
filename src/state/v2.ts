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

/* ---------- savings welcome ---------- */

export interface SavingsStat { period: string; dollars: number; lbs: number; meals: number }

const PERIODS: [string, number][] = [['week', 7], ['2 weeks', 14], ['month', 30], ['3 months', 90]];

/** A believable "you saved" figure for a random recent period. `rand` returns 0..1. */
export function savingsStat(rand: () => number = Math.random): SavingsStat {
  const [period, days] = PERIODS[Math.floor(rand() * PERIODS.length)];
  const perDay = 1.1 + rand() * 0.9; // about $8 to $14 a week, in line with USDA estimates of household food waste
  const dollars = Math.round(days * perDay);
  const lbs = Math.round(dollars * (0.38 + rand() * 0.12) * 10) / 10;
  return { period, dollars, lbs, meals: Math.max(1, Math.round(lbs / 1.2)) };
}

/* ---------- voice input ---------- */

export interface VoiceItem {
  name: string;
  brand: string;
  count: number;
  size: string;
  /** Days until it expires, if said. */
  days: number | null;
  /** Food table entry found, for place and shelf life. */
  known: boolean;
}

const NUMBERS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, half: 0.5, dozen: 12,
};
const BRANDS = ['Horizon', 'Organic Valley', 'Fairlife', 'Chobani', 'Fage', 'Oikos', 'Tillamook', 'Kerrygold', 'Driscoll’s', 'Driscolls', 'Dave’s Killer', 'Daves Killer',
  'Nature’s Own', 'Barilla', 'Trader Joe’s', 'Trader Joes', 'Kirkland', 'Great Value', 'Good & Gather', 'Land O Lakes', 'Perdue', 'Tyson', 'Mission', 'Eggland’s Best', 'Vital Farms'];
const SIZE_UNITS = ['half gallon', 'gallon', 'quart', 'pint', 'ounce', 'oz', 'pound', 'lb', 'liter', 'bag', 'box', 'carton', 'loaf', 'can', 'bottle', 'bunch', 'pack', 'tub', 'jar', 'block', 'dozen'];
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const numOf = (w: string) => (/^\d+(\.\d+)?$/.test(w) ? Number(w) : NUMBERS[w]);
const plural = (unit: string, n: number) => (n > 1 && !/s$/.test(unit) && unit !== 'oz' && unit !== 'lb' ? (unit === 'loaf' ? 'loaves' : unit === 'bunch' ? 'bunches' : unit === 'box' ? 'boxes' : unit + 's') : unit);

/** Days from `today` until a spoken date: today, tomorrow, in 5 days, next week, Friday, November 30, 11/30. */
export function spokenDays(text: string, today: Date): number | null {
  const t = text.toLowerCase();
  const day = 86400000;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (/\btoday\b/.test(t)) return 0;
  if (/\btomorrow\b/.test(t)) return 1;
  let m = t.match(/(?:\bin |^\s*)(\w+) (day|week|month)s?\b/);
  if (m && numOf(m[1]) !== undefined) return Math.round(numOf(m[1]) * (m[2] === 'day' ? 1 : m[2] === 'week' ? 7 : 30));
  if (/\bnext week\b/.test(t)) return 7;
  if (/\bnext month\b/.test(t)) return 30;
  m = t.match(new RegExp('\\b(' + MONTHS.join('|') + ')\\s+(\\d{1,2})'));
  const md = m ? [MONTHS.indexOf(m[1]), Number(m[2])] : (t.match(/\b(\d{1,2})\/(\d{1,2})\b/) ?? []).slice(1).map(Number).map((v, i) => (i === 0 ? v - 1 : v));
  if (md.length === 2 && !Number.isNaN(md[0])) {
    let d = new Date(start.getFullYear(), md[0], md[1]);
    if (d < start) d = new Date(start.getFullYear() + 1, md[0], md[1]);
    return Math.round((d.getTime() - start.getTime()) / day);
  }
  const wd = WEEKDAYS.findIndex((w) => new RegExp('\\b' + w + '\\b').test(t));
  if (wd >= 0) return ((wd - start.getDay() + 7) % 7) || 7;
  return null;
}

/** Reads a spoken grocery: "two half gallons of Horizon milk, expires next Friday". */
export function parseVoice(text: string, today: Date = new Date()): VoiceItem | null {
  const raw = text.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase().replace(/[.,!?]/g, ' ');
  // Split off the date part so "in 5 days" is not read as a count.
  const [what, ...rest] = lower.split(/\b(?:expires?|expiring|good (?:until|till|for)|best by|use by|sell by|lasts?)\b/);
  const days = rest.length ? spokenDays(rest.join(' '), today) : spokenDays(lower.match(/\b(today|tomorrow)\b/) ? lower : '', today);

  const brand = BRANDS.find((b) => what.includes(b.toLowerCase())) ?? '';
  const words = what.replace(brand.toLowerCase(), ' ').split(/\s+/).filter(Boolean);

  let count = 1, size = '';
  for (let i = 0; i < words.length; i++) {
    const n = numOf(words[i]);
    const two = words.slice(i + 1, i + 3).join(' ').replace(/s\b/g, '');
    const one = (words[i + 1] ?? '').replace(/(es|s)$/, '');
    const unit = SIZE_UNITS.find((u) => two.startsWith(u)) ?? SIZE_UNITS.find((u) => one === u || one === u.replace(/f$/, 'v'));
    if (n !== undefined && unit) {
      if (unit === 'dozen') { count = n === 0.5 ? 6 : n * 12; size = ''; } else { count = n; size = unit; }
      break;
    }
    if (n !== undefined && words[i] !== 'a' && words[i] !== 'an') { count = n === 0.5 ? 1 : n; }
    if (words[i] === 'dozen') { count = (n ?? 1) * 12; }
  }
  if (!size) {
    const lone = SIZE_UNITS.find((u) => what.includes(' ' + u) || what.startsWith(u));
    if (lone && lone !== 'dozen') size = lone;
  }
  const food = findFood(words.filter((w) => numOf(w) === undefined).join(' '));
  const name = food?.name ?? words.filter((w) => numOf(w) === undefined && !SIZE_UNITS.includes(w.replace(/s$/, '')) && !['of', 'and', 'some', 'i', 'got', 'bought', 'have'].includes(w)).join(' ');
  if (!name) return null;
  return { name: food ? name : name.replace(/^\w/, (c) => c.toUpperCase()), brand, count, size, days, known: !!food };
}

/** The pantry quantity text for a spoken item: "2 half gallons", "12", "1 bag". */
export const voiceQty = (v: VoiceItem) => (v.size ? v.count + ' ' + plural(v.size, v.count) : v.count > 1 ? String(v.count) : '');

export const VOICE_SAMPLES = [
  'Two half gallons of Horizon organic milk, expires next Friday',
  'A dozen Vital Farms eggs, best by December 12',
  'One pound of Driscoll’s strawberries',
  '32 ounce tub of Chobani yogurt, good for 2 weeks',
];
