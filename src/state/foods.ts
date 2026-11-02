// The fixed food table behind add-item suggestions, the pretend scanner and the savings math. Pure data and lookups.
//
// Sources, recorded per row:
//   price  BLS = US city average prices, September 2026. ERS = USDA ERS Fruit and Vegetable Prices (2023 data).
//          EST = team estimate, no listed price found.
//   days   MDH = Minnesota Dept. of Health refrigerator and freezer chart. TAMU = Texas A&M AgriLife E-200.
//          FK = USDA FoodKeeper as reported second hand (the official file blocks automated download).
//          EST = team estimate.
// Grams use USDA standard reference portions (for example 1 cup raw spinach = 30 g).
import type { Unit } from './types';

export type Storage = 'Fridge' | 'Freezer' | 'Pantry';
type PriceSource = 'BLS' | 'ERS' | 'EST';
type DaysSource = 'MDH' | 'TAMU' | 'FK' | 'EST';

export interface Food {
  name: string;
  aliases: string[];
  /** Usual quantity, shown in the form. */
  qty: string;
  /** Usual place. */
  loc: string;
  /** Grams in the usual quantity. */
  packG: number;
  pricePerLb: number;
  priceSrc: PriceSource;
  /** Days it lasts, by place. A missing place means it does not keep there. */
  days: Partial<Record<Storage, number>>;
  daysSrc: DaysSource;
  /** Grams per recipe unit, where the unit is not a plain weight. */
  grams: Partial<Record<Unit, number>>;
}

const row = (
  name: string, qty: string, loc: string, packG: number, pricePerLb: number, priceSrc: PriceSource,
  days: Food['days'], daysSrc: DaysSource, grams: Food['grams'] = {}, aliases: string[] = [],
): Food => ({ name, qty, loc, packG, pricePerLb, priceSrc, days, daysSrc, grams, aliases });

const FROZEN = 240;

export const FOODS: Food[] = [
  // Produce
  row('Spinach', '1 bag', 'Fridge', 142, 4.5, 'ERS', { Fridge: 2, Freezer: FROZEN }, 'TAMU', { cup: 30 }, ['Baby spinach']),
  row('Kale', '1 bunch', 'Fridge', 200, 3.57, 'ERS', { Fridge: 2, Freezer: FROZEN }, 'TAMU', { cup: 21 }),
  row('Lettuce', '1 head', 'Fridge', 360, 3.31, 'BLS', { Fridge: 7 }, 'TAMU', { cup: 47 }, ['Romaine']),
  row('Tomatoes', '4', 'Fridge', 492, 1.99, 'BLS', { Fridge: 3, Pantry: 5 }, 'TAMU', { whole: 123, cup: 149 }),
  row('Cherry tomatoes', '1 pint', 'Counter', 298, 4.16, 'ERS', { Fridge: 3, Pantry: 5 }, 'TAMU', { cup: 149 }, ['Grape tomatoes']),
  row('Onion', '3', 'Pantry', 330, 1.06, 'ERS', { Pantry: 21, Fridge: 30 }, 'TAMU', { whole: 110, cup: 160 }, ['Onions']),
  row('Garlic', '1 head', 'Pantry', 40, 5, 'EST', { Pantry: 21 }, 'EST', { clove: 3, whole: 40 }),
  row('Potatoes', '5 lb', 'Pantry', 2268, 0.99, 'BLS', { Pantry: 14 }, 'TAMU', { whole: 213, cup: 150 }),
  row('Carrots', '1 lb', 'Fridge', 454, 1.01, 'ERS', { Fridge: 14, Freezer: FROZEN }, 'TAMU', { whole: 61, cup: 128 }),
  row('Broccoli', '1 head', 'Fridge', 300, 3.02, 'ERS', { Fridge: 5, Freezer: FROZEN }, 'TAMU', { cup: 91 }),
  row('Bell pepper', '2', 'Fridge', 238, 1.5, 'ERS', { Fridge: 7, Freezer: FROZEN }, 'EST', { whole: 119, cup: 149 }, ['Peppers']),
  row('Mushrooms', '8 oz', 'Fridge', 227, 4.15, 'ERS', { Fridge: 5 }, 'EST', { cup: 70 }),
  row('Zucchini', '2', 'Fridge', 392, 1.64, 'ERS', { Fridge: 5, Freezer: FROZEN }, 'EST', { whole: 196, cup: 124 }),
  row('Cucumber', '1', 'Fridge', 300, 1.09, 'ERS', { Fridge: 5 }, 'EST', { whole: 300, cup: 119 }),
  // Fruit
  row('Strawberries', '1 pint', 'Fridge', 340, 3.79, 'BLS', { Fridge: 3, Freezer: FROZEN }, 'TAMU', { cup: 144 }),
  row('Blueberries', '1 pint', 'Fridge', 340, 5.13, 'ERS', { Fridge: 3, Freezer: FROZEN }, 'TAMU', { cup: 148 }),
  row('Grapes', '2 lb', 'Fridge', 907, 2.25, 'ERS', { Fridge: 5 }, 'TAMU', { cup: 151 }),
  row('Bananas', '5', 'Pantry', 590, 0.66, 'BLS', { Pantry: 3, Freezer: FROZEN }, 'TAMU', { whole: 118, cup: 150 }, ['Banana']),
  row('Apples', '6', 'Fridge', 1092, 1.86, 'ERS', { Fridge: 30, Pantry: 2 }, 'TAMU', { whole: 182, cup: 125 }),
  row('Oranges', '4', 'Pantry', 524, 1.72, 'BLS', { Pantry: 14 }, 'TAMU', { whole: 131 }),
  row('Lemon', '2', 'Fridge', 168, 2.13, 'BLS', { Fridge: 14, Pantry: 7 }, 'EST', { whole: 84 }, ['Lemons']),
  row('Lime', '2', 'Fridge', 134, 2.13, 'BLS', { Fridge: 14, Pantry: 7 }, 'EST', { whole: 67 }, ['Limes']),
  // Dairy and eggs
  row('Milk', 'Half gallon', 'Fridge', 1952, 0.48, 'BLS', { Fridge: 7, Freezer: 90 }, 'EST', { cup: 244 }),
  row('Yogurt', '32 oz tub', 'Fridge', 907, 2.5, 'EST', { Fridge: 14, Freezer: 60 }, 'EST', { cup: 245 }),
  row('Eggs', '1 dozen', 'Fridge', 600, 1.72, 'BLS', { Fridge: 21 }, 'MDH', { whole: 50 }),
  row('Cheddar', '8 oz block', 'Fridge', 227, 6.13, 'BLS', { Fridge: 21, Freezer: 180 }, 'EST', { cup: 113 }, ['Cheese']),
  row('Butter', '1 lb', 'Fridge', 454, 5, 'EST', { Fridge: 30, Freezer: 180 }, 'EST', { cup: 227, tbsp: 14 }),
  // Meat
  row('Ground beef', '1 lb', 'Fridge', 454, 6.79, 'BLS', { Fridge: 2, Freezer: 120 }, 'MDH', {}, ['Hamburger', 'Beef']),
  row('Chicken thighs', '1 lb', 'Fridge', 454, 1.74, 'BLS', { Fridge: 2, Freezer: 270 }, 'MDH', {}, ['Chicken']),
  row('Chicken breast', '1 lb', 'Fridge', 454, 4.2, 'BLS', { Fridge: 2, Freezer: 270 }, 'MDH'),
  row('Pork chops', '1 lb', 'Fridge', 454, 4.55, 'BLS', { Fridge: 5, Freezer: 180 }, 'MDH'),
  row('Bacon', '12 oz', 'Fridge', 340, 6.76, 'BLS', { Fridge: 7, Freezer: 30 }, 'MDH'),
  row('Ham', '1 lb', 'Fridge', 454, 5.45, 'BLS', { Fridge: 5, Freezer: 60 }, 'MDH'),
  // Pantry staples and frozen
  row('Bread', '1 loaf', 'Pantry', 567, 1.83, 'BLS', { Pantry: 14, Fridge: 14, Freezer: 120 }, 'FK', { whole: 25 }),
  row('Tortillas', '8', 'Pantry', 392, 2.5, 'EST', { Pantry: 7, Fridge: 21, Freezer: 180 }, 'EST', { whole: 49 }),
  row('Rice', '2 lb', 'Pantry', 907, 1.12, 'BLS', { Pantry: 365 }, 'FK', { cup: 185 }),
  row('Pasta', '1 lb', 'Pantry', 454, 1.38, 'BLS', { Pantry: 365 }, 'EST', { cup: 100 }, ['Spaghetti']),
  row('Orzo', '1 lb', 'Pantry', 454, 1.38, 'BLS', { Pantry: 365 }, 'EST', { cup: 170 }),
  row('Flour', '5 lb', 'Pantry', 2268, 0.55, 'BLS', { Pantry: 180 }, 'EST', { cup: 125 }),
  row('Frozen peas', '1 bag', 'Freezer', 340, 2.19, 'ERS', { Freezer: FROZEN }, 'EST', { cup: 134 }, ['Peas']),
  row('Frozen spinach', '1 bag', 'Freezer', 340, 2.47, 'ERS', { Freezer: FROZEN }, 'EST', { cup: 156 }),
];

const lower = (s: string) => s.trim().toLowerCase();
const names = (f: Food) => [f.name, ...f.aliases].map(lower);
const wordIn = (text: string, word: string) => (' ' + text + ' ').includes(' ' + word + ' ');

/** The table entry for a name: exact name or alias first, then the longest name found as whole words. */
export function findFood(name: string): Food | undefined {
  const q = lower(name);
  if (!q) return undefined;
  const exact = FOODS.find((f) => names(f).includes(q));
  if (exact) return exact;
  let best: Food | undefined, bestLen = 0;
  for (const f of FOODS) {
    for (const n of names(f)) {
      if (n.length > bestLen && wordIn(q, n)) { best = f; bestLen = n.length; }
    }
  }
  return best;
}

/** Up to three suggestions for what has been typed: names that start with it first, then words that do. */
export function suggestFoods(text: string): Food[] {
  const q = lower(text);
  if (q.length < 2) return [];
  const rank = (f: Food) => {
    if (names(f).some((n) => n.startsWith(q))) return 0;
    return names(f).some((n) => n.split(' ').some((w) => w.startsWith(q))) ? 1 : 2;
  };
  return FOODS.map((f) => ({ f, r: rank(f) })).filter((x) => x.r < 2).sort((a, b) => a.r - b.r).slice(0, 3).map((x) => x.f);
}

/** How long a food lasts in a place. Counter uses the Pantry timeline. Null when there is nothing to go on. */
export function daysIn(food: Food | undefined, place: string): number | null {
  if (!food) return null;
  const key = place === 'Counter' ? 'Pantry' : place;
  return (food.days as Record<string, number | undefined>)[key] ?? null;
}

/** The pretend scanner walks through the Task 1 groceries, then repeats. */
export const SCAN_GROCERIES = ['Milk', 'Yogurt', 'Strawberries', 'Ground beef', 'Bread'];

export const scanFood = (index: number): Food => findFood(SCAN_GROCERIES[index % SCAN_GROCERIES.length])!;
