import { describe, expect, it } from 'vitest';
import { createInitialState } from './seed';
import {
  applyRecipeFilters, checkAmount, dayFmt, draftView, expLabel, expOk, fmtAmt, match, pantryFilterParts, pantryRows,
  recipeCard, recipeList, task, validateDuration, validatePlace,
} from './selectors';
import { RECIPES } from './seed';
import type { AppState, Draft } from './types';

const fresh = (patch: Partial<AppState> = {}): AppState => ({ ...createInitialState(), ...patch });
const spinach = { id: 99, name: 'Baby spinach', loc: 'Fridge', qty: '1 bag', days: 5 };

describe('match', () => {
  it('matches equal names case-insensitively', () => expect(match('Eggs', 'eggs')).toBe(true));
  it('matches when either contains the other', () => {
    expect(match('Baby spinach', 'Spinach')).toBe(true);
    expect(match('Spinach', 'Baby spinach')).toBe(true);
  });
  it('rejects unrelated names', () => expect(match('Rice', 'Milk')).toBe(false));
});

describe('task()', () => {
  it('starts at 0 of 3', () => expect(task(fresh())).toEqual({ g1: false, g2: false, g3: false, done: 0 }));
  it('g1: any pantry item containing "spinach"', () => {
    expect(task(fresh({ pantry: [spinach] })).g1).toBe(true);
  });
  it('g2: saving a spinach recipe counts, a non-spinach one does not', () => {
    expect(task(fresh({ saved: ['chickenrice'] })).g2).toBe(false);
    expect(task(fresh({ saved: ['smoothie'] })).g2).toBe(true);
  });
  it('g3: sharing a spinach recipe, including one the user wrote', () => {
    const mine = [{ ...RECIPES[1], id: 'mine20', ings: ['Spinach leaves'] }];
    expect(task(fresh({ mine, shared: ['mine20'] })).g3).toBe(true);
    expect(task(fresh({ shared: ['tacos'] })).g3).toBe(false);
  });
  it('counts done across all three', () => {
    expect(task(fresh({ pantry: [spinach], saved: ['frittata'], shared: ['frittata'] })).done).toBe(3);
  });
});

describe('expLabel', () => {
  it.each([[0, 'Today'], [-2, 'Today'], [1, 'Tomorrow'], [3, '3 days'], [10, '10 days'], [14, '2 wks'], [60, '9 wks'], [61, 'Months'], [200, 'Months']])(
    '%i -> %s', (d, label) => expect(expLabel(d)).toBe(label),
  );
});

describe('dayFmt', () => {
  it.each([[1, '1 day'], [5, '5 days'], [7, '1 week'], [14, '2 weeks'], [30, '1 month'], [60, '2 months'], [10, '10 days'], [210, '7 months']])(
    '%i -> %s', (v, label) => expect(dayFmt(v)).toBe(label),
  );
});

describe('fmtAmt', () => {
  it('formats fractions and plurals', () => {
    expect(fmtAmt(0.5, 'cup')).toBe('1/2 cup');
    expect(fmtAmt(2, 'cup')).toBe('2 cups');
    expect(fmtAmt(1.5, 'lb')).toBe('1 1/2 lb');
    expect(fmtAmt(6, 'whole')).toBe('6 whole');
    expect(fmtAmt(2, 'clove')).toBe('2 cloves');
  });
});

describe('pantry filtering', () => {
  it('sorts by days left', () => {
    expect(pantryRows(fresh()).map((p) => p.days)).toEqual([1, 2, 3, 5, 12, 14, 18, 21, 120, 200]);
  });
  it('filters by place', () => {
    expect(pantryRows(fresh({ loc: 'Fridge' })).map((p) => p.name)).toEqual(['Chicken thighs', 'Milk', 'Eggs', 'Cheddar']);
  });
  it('filters by expiry window', () => {
    expect(expOk('soon', 3)).toBe(true);
    expect(expOk('soon', 4)).toBe(false);
    expect(expOk('week', 7)).toBe(true);
    expect(expOk('later', 7)).toBe(false);
    expect(pantryRows(fresh({ exp: 'soon' }))).toHaveLength(3);
    expect(pantryRows(fresh({ exp: 'week' }))).toHaveLength(4);
    expect(pantryRows(fresh({ exp: 'later' }))).toHaveLength(6);
  });
  it('combines place and expiry, and summarises them', () => {
    const st = fresh({ loc: 'Pantry', exp: 'week' });
    expect(pantryRows(st).map((p) => p.name)).toEqual(['Tortillas']);
    expect(pantryFilterParts(st)).toEqual(['Pantry', 'This week']);
  });
  it('marks items with 3 days or fewer as warn', () => {
    const rows = pantryRows(fresh());
    expect(rows[2]).toMatchObject({ name: 'Milk', tagCls: 'warn', exp: '3 days', sub: 'Fridge · Half gallon' });
    expect(rows[3].tagCls).toBe('');
  });
});

describe('recipe filtering', () => {
  const pantry = createInitialState().pantry;
  const cards = RECIPES.filter((r) => !r.friend).map((r) => recipeCard(pantry, r));
  const ids = (l: { id: string }[]) => l.map((r) => r.id).sort();

  it('card text', () => {
    const c = recipeCard(pantry, RECIPES[0]);
    expect(c.matchText).toBe('You have 4 of 5');
    expect(c.soonText).toBe('Uses up cherry tomatoes');
    expect(recipeCard(pantry, RECIPES[2]).matchText).toBe('You have everything');
  });
  it('uses what’s expiring', () => {
    expect(ids(applyRecipeFilters(cards, ['soon'], []))).toEqual(['chickenrice', 'frittata', 'pasta', 'smoothie']);
  });
  it('20 min or less', () => {
    expect(ids(applyRecipeFilters(cards, ['quick'], []))).toEqual(['friedrice', 'quesadilla', 'smoothie']);
  });
  it('I have everything', () => {
    expect(ids(applyRecipeFilters(cards, ['ready'], []))).toEqual(['chickenrice', 'friedrice']);
  });
  it('fits my food preferences (all prefs must match; ignored when none saved)', () => {
    expect(ids(applyRecipeFilters(cards, ['diet'], ['Vegetarian', 'Gluten-free']))).toEqual(['frittata', 'smoothie']);
    expect(applyRecipeFilters(cards, ['diet'], [])).toHaveLength(cards.length);
  });
  it('search matches titles and ingredients, sorted by match on Discover', () => {
    const { list } = recipeList(fresh({ q: 'spinach' }));
    expect(list.map((r) => r.id)).toEqual(['frittata', 'quesadilla', 'smoothie']);
  });
  it('empty-state copy', () => {
    expect(recipeList(fresh({ seg: 'saved' }))).toMatchObject({ emptyTitle: 'No saved recipes yet' });
    expect(recipeList(fresh({ seg: 'mine' }))).toMatchObject({ emptyTitle: 'No recipes of your own yet' });
    expect(recipeList(fresh({ q: 'zzz' }))).toMatchObject({ emptyTitle: 'No matches', emptyText: 'Try a different search.' });
  });
});

describe('custom place and time validation', () => {
  it('place rules', () => {
    expect(validatePlace('  ', ['Fridge']).err).toBe('Type a name for the place.');
    expect(validatePlace('Garage-fridge', []).err).toBe('Use letters, numbers and spaces only.');
    expect(validatePlace('fridge', ['Fridge']).err).toBe('“fridge” is already on the list.');
    expect(validatePlace('all', []).err).toBe('“all” is already on the list.');
    expect(validatePlace('  Garage   fridge ', [])).toEqual({ value: 'Garage fridge', err: '' });
    expect(validatePlace('x'.repeat(21), []).err).toBe('Use 20 characters or fewer.');
  });
  it('time rules', () => {
    expect(validateDuration('', 'days').err).toBe('Enter a whole number from 1 to 365 days.');
    expect(validateDuration('1.5', 'weeks').err).toBe('Enter a whole number from 1 to 52 weeks.');
    expect(validateDuration('13', 'months').err).toBe('Enter a whole number from 1 to 12 months.');
    expect(validateDuration('2', 'weeks')).toEqual({ days: 14, err: '' });
    expect(validateDuration('3', 'months')).toEqual({ days: 90, err: '' });
  });
});

describe('recipe draft validation', () => {
  const draft = (patch: Partial<Draft>): Draft => ({ ...createInitialState().d, ...patch });

  it('amounts must be above 0, up to 999', () => {
    expect(checkAmount('').bad).toBe(true);
    expect(checkAmount('0').bad).toBe(true);
    expect(checkAmount('1000').bad).toBe(true);
    expect(checkAmount('abc').bad).toBe(true);
    expect(checkAmount('0.5').bad).toBe(false);
    expect(checkAmount('999').bad).toBe(false);
  });
  it('step 1 needs a title', () => {
    expect(draftView(draft({ title: '  ' }), 1).noTitle).toBe(true);
    expect(draftView(draft({ title: 'Pie' }), 1).noTitle).toBe(false);
  });
  it('step 2 blocks with no ingredients, then with a bad amount', () => {
    expect(draftView(draft({}), 2)).toMatchObject({ blockIngs: true, blockText: 'Pick at least one ingredient' });
    const bad = draftView(draft({ ings: ['Eggs'], amts: { Eggs: { q: '0', u: 'whole' } } }), 2);
    expect(bad).toMatchObject({ blockIngs: true, blockText: 'Fix the amounts above to continue' });
    const ok = draftView(draft({ ings: ['Eggs'], amts: { Eggs: { q: '2', u: 'whole' } } }), 2);
    expect(ok.blockIngs).toBe(false);
    expect(ok.rows[0].label).toBe('Eggs · 2 whole');
  });
  it('step 3 needs a step', () => {
    expect(draftView(draft({}), 3).noSteps).toBe(true);
    expect(draftView(draft({ steps: ['Mix'] }), 3)).toMatchObject({ noSteps: false, stepName: 'Steps', pct: '75%', nextStepN: 2 });
  });
});
