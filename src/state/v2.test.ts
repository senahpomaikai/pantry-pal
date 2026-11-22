import { describe, expect, it } from 'vitest';
import { reducer } from './reducer';
import { createInitialState } from './seed';
import { V2_RECIPES, comboRecipes, duplicateOf, receiptLines, shelfLife, sizeOptions } from './v2';
import { hasGroceries } from './task';
import type { AppState } from './types';

const v2 = (): AppState => ({ ...createInitialState(), showWelcome: false, bonus: V2_RECIPES, rememberDays: true });

describe('v2 revisions', () => {
  it('finds one recipe that uses spinach and chicken together', () => {
    const st = v2();
    const ids = st.pantry.filter((p) => p.name === 'Spinach' || p.name === 'Chicken thighs').map((p) => p.id);
    const top = comboRecipes({ ...st, pick: ids })[0];
    expect(top.usesAll).toBe(true);
    expect(top.ings).toEqual(expect.arrayContaining(['Spinach', 'Chicken thighs']));
  });

  it('warns about duplicates by food, not exact spelling', () => {
    const st = v2();
    expect(duplicateOf(st.pantry, 'cheese')?.name).toBe('Cheddar');
    expect(duplicateOf(st.pantry, 'Milk')).toBeUndefined();
  });

  it('offers common package sizes and keeps a custom one', () => {
    expect(sizeOptions('Milk', 'Half gallon')).toEqual(['Quart', 'Half gallon', 'Gallon']);
    expect(sizeOptions('Milk', '24 oz')).toContain('24 oz');
  });

  it('remembers a shelf life set by hand, only when asked', () => {
    let st = v2();
    st = reducer(st, { type: 'pickFood', name: 'Eggs' });
    st = reducer(st, { type: 'setF', patch: { days: 14 } });
    st = reducer(st, { type: 'addManual' });
    expect(shelfLife(st, 'Eggs', 'Fridge')).toEqual({ days: 14, saved: true });
    st = reducer(st, { type: 'pickFood', name: 'Eggs' });
    expect(st.f.days).toBe(14);

    let off = { ...v2(), rememberDays: false };
    off = reducer(off, { type: 'pickFood', name: 'Eggs' });
    off = reducer(off, { type: 'setF', patch: { days: 14 } });
    off = reducer(off, { type: 'addManual' });
    expect(off.savedDays).toEqual({});
  });

  it('adds a whole receipt at once, finishing the Task 1 groceries', () => {
    let st = reducer(v2(), { type: 'readReceipt', source: 'receipt' });
    expect(st.receipt).toHaveLength(receiptLines(v2()).length);
    st = reducer(st, { type: 'addReceipt' });
    expect(hasGroceries(st.pantry)).toBe(true);
    expect(st.screen).toBe('pantry');
  });

  it('adds missing recipe ingredients to the shopping list once', () => {
    let st: AppState = { ...v2(), recipeId: 'pasta' };
    st = reducer(st, { type: 'addMissing' });
    expect(st.shopping).toEqual(['Pasta', 'Milk']);
    st = reducer(st, { type: 'addMissing' });
    expect(st.shopping).toEqual(['Pasta', 'Milk']);
  });

  it('leaves A and B alone: no bonus recipes and nothing remembered', () => {
    const st = createInitialState();
    expect(st.bonus).toEqual([]);
    expect(st.rememberDays).toBe(false);
  });
});
