import { describe, expect, it } from 'vitest';
import { FOODS, SCAN_GROCERIES, daysIn, findFood, scanFood, suggestFoods } from './foods';
import { amountGrams, impactText, itemImpact, quantityGrams, recipeImpact } from './impact';
import { RECIPES, createInitialState } from './seed';
import { LOCS } from './seed';

const item = (name: string, qty: string, days: number) => ({ id: 1, name, qty, loc: 'Fridge', days });

describe('food table', () => {
  it('has every recipe ingredient and Task 1 grocery', () => {
    const needed = [...RECIPES.flatMap((r) => r.ings), ...SCAN_GROCERIES];
    expect(needed.filter((n) => !findFood(n))).toEqual([]);
  });
  it('has about 40 foods, with no repeated names', () => {
    expect(FOODS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(FOODS.map((f) => f.name)).size).toBe(FOODS.length);
  });
  it('every usual place is a real place with a timeline', () => {
    for (const f of FOODS) {
      expect(LOCS).toContain(f.loc);
      expect(daysIn(f, f.loc), f.name).not.toBeNull();
    }
  });
  it('matches names and aliases', () => {
    expect(findFood('Baby spinach')?.name).toBe('Spinach');
    expect(findFood('frozen spinach')?.name).toBe('Frozen spinach');
    expect(findFood('Organic whole milk')?.name).toBe('Milk');
    expect(findFood('Dragon fruit')).toBeUndefined();
    expect(findFood('licorice')).toBeUndefined();
  });
});

describe('suggestions', () => {
  it('needs two letters and caps at three', () => {
    expect(suggestFoods('s')).toEqual([]);
    expect(suggestFoods('ch').length).toBeLessThanOrEqual(3);
    expect(suggestFoods('ch').map((f) => f.name)).toContain('Cheddar');
  });
  it('puts names that start with the text first', () => {
    expect(suggestFoods('spin')[0].name).toBe('Spinach');
    expect(suggestFoods('spin').map((f) => f.name)).toContain('Frozen spinach');
  });
  it('finds nothing for unknown food', () => expect(suggestFoods('zzz')).toEqual([]));
});

describe('shelf life by place', () => {
  it('changes with the place, and Counter uses Pantry', () => {
    const beef = findFood('Ground beef');
    expect(daysIn(beef, 'Fridge')).toBe(2);
    expect(daysIn(beef, 'Freezer')).toBe(120);
    expect(daysIn(findFood('Bananas'), 'Counter')).toBe(3);
  });
  it('is unknown for places a food does not keep, and for unknown food', () => {
    expect(daysIn(findFood('Eggs'), 'Freezer')).toBeNull();
    expect(daysIn(undefined, 'Fridge')).toBeNull();
  });
});

describe('scanner', () => {
  it('walks the Task 1 groceries and repeats', () => {
    expect([0, 1, 2, 3, 4, 5].map((i) => scanFood(i).name)).toEqual(['Milk', 'Yogurt', 'Strawberries', 'Ground beef', 'Bread', 'Milk']);
  });
});

describe('amounts', () => {
  const spinach = findFood('Spinach');
  it('reads simple quantities and falls back to the package', () => {
    expect(quantityGrams('1 lb', undefined)).toBeCloseTo(453.6);
    expect(quantityGrams('8 oz', spinach)).toBeCloseTo(226.8);
    expect(quantityGrams('Half a bag', spinach)).toBe(71);
    expect(quantityGrams('1 bag', spinach)).toBe(142);
    expect(quantityGrams('6', findFood('Eggs'))).toBe(300);
    expect(quantityGrams('', spinach)).toBe(142);
  });
  it('converts recipe units', () => {
    expect(amountGrams(2, 'cup', spinach)).toBe(60);
    expect(amountGrams(2, 'clove', findFood('Garlic'))).toBe(6);
    expect(amountGrams(1.5, 'lb', undefined)).toBeCloseTo(680.4);
  });
});

describe('impact', () => {
  const st = (recipeId: string) => ({ ...createInitialState(), recipeId });
  const ids = (s: ReturnType<typeof st>) => s.pantry.map((p) => p.id);

  it('counts only food close to expiring in a cooked recipe', () => {
    const frittata = st('frittata');
    expect(recipeImpact(frittata, ids(frittata))).toEqual({ dollars: 2, lbs: 0.5 });
  });
  it('counts only ticked items', () => {
    const frittata = st('frittata');
    expect(recipeImpact(frittata, [3])).toEqual({ dollars: 0.5, lbs: 0.1 });
  });
  it('is null when nothing used was at risk', () => {
    const friedRice = st('friedrice');
    expect(recipeImpact(friedRice, ids(friedRice))).toBeNull();
  });
  it('caps a recipe at what is in the pantry', () => {
    const chicken = st('chickenrice');
    expect(recipeImpact(chicken, ids(chicken))).toEqual({ dollars: 1.5, lbs: 1 });
  });
  it('counts a whole item for "I used it", only if at risk', () => {
    expect(itemImpact(item('Ground beef', '1 lb', 2))).toEqual({ dollars: 7, lbs: 1 });
    expect(itemImpact(item('Rice', '2 lb', 200))).toBeNull();
  });
  it('uses the table average for unknown food', () => {
    expect(itemImpact(item('Dragon fruit', '', 1))?.lbs).toBeGreaterThan(0);
  });
  it('writes the message', () => {
    expect(impactText({ dollars: 2, lbs: 0.5 })).toBe('You saved ~$2 and 0.5 lbs of food from going to the landfill');
    expect(impactText({ dollars: 1.5, lbs: 1 })).toBe('You saved ~$1.50 and 1 lb of food from going to the landfill');
  });
});
