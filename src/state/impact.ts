// Savings math for the impact message. Pure. Only food close to expiring counts: it is the food actually saved.
import { FOODS, findFood, type Food } from './foods';
import { findRecipe, match } from './selectors';
import type { AppState, Impact, PantryItem, Unit } from './types';

const G_PER_LB = 453.6;
const G_PER_OZ = 28.35;
/** Same cutoff as the app's "expiring soon". */
const AT_RISK_DAYS = 3;

const AVERAGE = {
  packG: FOODS.reduce((sum, f) => sum + f.packG, 0) / FOODS.length,
  pricePerLb: FOODS.reduce((sum, f) => sum + f.pricePerLb, 0) / FOODS.length,
};

const WEIGHT_UNITS: Record<string, number> = {
  lb: G_PER_LB, lbs: G_PER_LB, pound: G_PER_LB, pounds: G_PER_LB, oz: G_PER_OZ, ounce: G_PER_OZ, ounces: G_PER_OZ, g: 1, kg: 1000,
};

/** Grams in a pantry quantity. Reads simple amounts ("1 lb", "8", "Half a bag"), otherwise the usual package. */
export function quantityGrams(qty: string, food: Food | undefined): number {
  const pack = food?.packG ?? AVERAGE.packG;
  const text = qty.trim().toLowerCase();
  if (text.startsWith('half')) return pack / 2;
  const m = text.match(/^(\d+(?:\.\d+)?)\s*([a-z]*)/);
  if (!m) return pack;
  const n = Number(m[1]), unit = m[2];
  if (WEIGHT_UNITS[unit]) return n * WEIGHT_UNITS[unit];
  if (unit === 'cup' || unit === 'cups') return food?.grams.cup ? n * food.grams.cup : pack;
  if (!unit) return food?.grams.whole ? n * food.grams.whole : pack;
  return pack;
}

/** Grams for one recipe amount. */
export function amountGrams(q: number, u: Unit, food: Food | undefined): number {
  const pack = food?.packG ?? AVERAGE.packG, cup = food?.grams.cup ?? 240;
  switch (u) {
    case 'lb': return q * G_PER_LB;
    case 'oz': return q * G_PER_OZ;
    case 'cup': return q * cup;
    case 'tbsp': return q * (food?.grams.tbsp ?? cup / 16);
    case 'tsp': return (q * cup) / 48;
    case 'clove': return q * (food?.grams.clove ?? 3);
    case 'pinch': return q * 0.4;
    case 'whole': return q * (food?.grams.whole ?? pack);
  }
}

const saving = (parts: { food: Food | undefined; grams: number }[]): Impact | null => {
  if (!parts.length) return null;
  const grams = parts.reduce((sum, p) => sum + p.grams, 0);
  const dollars = parts.reduce((sum, p) => sum + (p.grams / G_PER_LB) * (p.food?.pricePerLb ?? AVERAGE.pricePerLb), 0);
  return {
    dollars: Math.max(0.5, Math.round(dollars * 2) / 2),
    lbs: Math.max(0.1, Math.round((grams / G_PER_LB) * 10) / 10),
  };
};

/** "I used it" on one item counts the whole item, if it was at risk. */
export function itemImpact(item: PantryItem): Impact | null {
  if (item.days > AT_RISK_DAYS) return null;
  const food = findFood(item.name);
  return saving([{ food, grams: quantityGrams(item.qty, food) }]);
}

/** A cooked recipe counts what it uses of the ticked items at risk, capped at what was in the pantry. */
export function recipeImpact(st: Pick<AppState, 'mine' | 'pantry' | 'recipeId'>, ids: number[]): Impact | null {
  const rec = findRecipe(st, st.recipeId);
  if (!rec) return null;
  const parts = st.pantry.filter((p) => ids.includes(p.id) && p.days <= AT_RISK_DAYS).flatMap((p) => {
    const i = rec.ings.findIndex((ing) => match(ing, p.name));
    if (i < 0) return [];
    const food = findFood(p.name), [q, u] = rec.amts[i] ?? [1, 'whole'];
    return [{ food, grams: Math.min(amountGrams(q, u, food), quantityGrams(p.qty, food)) }];
  });
  return saving(parts);
}

const money = (d: number) => '$' + (Number.isInteger(d) ? String(d) : d.toFixed(2));

export function impactText({ dollars, lbs }: Impact): string {
  return `You saved ~${money(dollars)} and ${lbs} ${lbs === 1 ? 'lb' : 'lbs'} of food from going to the landfill`;
}
