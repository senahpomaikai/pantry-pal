import { describe, expect, it } from 'vitest';
import { applyDeepLink } from './deeplink';
import { reducer, type Action } from './reducer';
import { createInitialState } from './seed';
import type { AppState } from './types';
import { parseFlags } from '../variants';

const run = (actions: Action[], st: AppState = createInitialState()) => actions.reduce(reducer, st);

describe('adding groceries', () => {
  it('the scanner walks the groceries and stays open for the next one', () => {
    let st = run([{ type: 'go', screen: 'scan' }, { type: 'simScan' }]);
    expect(st).toMatchObject({ screen: 'scanResult', scanLoc: 'Fridge', scanDays: 7 });
    st = reducer(st, { type: 'addScanned' });
    expect(st.screen).toBe('scan');
    expect(st.pantry.at(-1)).toMatchObject({ name: 'Milk', qty: 'Half gallon', loc: 'Fridge', days: 7 });
    expect(st.toast.text).toBe('Milk added to your pantry');
    st = run([{ type: 'simScan' }, { type: 'addScanned' }], st);
    expect(st.pantry.at(-1)?.name).toBe('Yogurt');
  });
  it('closing the scanner goes to the pantry once something was added', () => {
    const st = run([{ type: 'go', screen: 'scan' }, { type: 'simScan' }, { type: 'addScanned' }, { type: 'back' }]);
    expect(st).toMatchObject({ screen: 'pantry', stack: [], addedNow: 0 });
    expect(run([{ type: 'go', screen: 'scan' }, { type: 'back' }]).screen).toBe('home');
  });
  it('the scanned place moves the days, unless they were chosen by hand', () => {
    const st = run([{ type: 'go', screen: 'scan' }, { type: 'simScan' }, { type: 'setScanLoc', loc: 'Freezer' }]);
    expect(st.scanDays).toBe(90);
    expect(run([{ type: 'setScanDays', days: 3 }, { type: 'setScanLoc', loc: 'Fridge' }], st).scanDays).toBe(3);
  });
  it('a suggestion fills in the form', () => {
    const st = run([{ type: 'go', screen: 'manual' }, { type: 'setF', patch: { name: 'grou' } }, { type: 'pickFood', name: 'Ground beef' }]);
    expect(st.f).toMatchObject({ name: 'Ground beef', qty: '1 lb', loc: 'Fridge', days: 2, picked: 'Ground beef' });
  });
  it('changing place moves the days; quantity does not', () => {
    let st = run([{ type: 'go', screen: 'manual' }, { type: 'pickFood', name: 'Ground beef' }, { type: 'setF', patch: { qty: '3 lb' } }]);
    expect(st.f.days).toBe(2);
    st = reducer(st, { type: 'setF', patch: { loc: 'Freezer' } });
    expect(st.f).toMatchObject({ loc: 'Freezer', days: 120 });
  });
  it('days chosen by hand stay put, and a place with no timeline changes nothing', () => {
    let st = run([{ type: 'go', screen: 'manual' }, { type: 'pickFood', name: 'Eggs' }, { type: 'setF', patch: { loc: 'Freezer' } }]);
    expect(st.f.days).toBe(21);
    st = run([{ type: 'setF', patch: { days: 30 } }, { type: 'setF', patch: { loc: 'Pantry' } }], st);
    expect(st.f.days).toBe(30);
  });
  it('the form stays open after adding, and Done goes to the pantry', () => {
    let st = run([{ type: 'go', screen: 'manual' }, { type: 'pickFood', name: 'Bread' }, { type: 'addManual' }]);
    expect(st).toMatchObject({ screen: 'manual', addedNow: 1 });
    expect(st.f.name).toBe('');
    st = run([{ type: 'setF', patch: { name: 'Plantains' } }, { type: 'addManual' }], st);
    expect(st.addedNow).toBe(2);
    st = reducer(st, { type: 'doneAdding' });
    expect(st).toMatchObject({ screen: 'pantry', stack: [], addedNow: 0 });
  });
  it('leaving the welcome screen stays on Home and opens setup', () => {
    expect(run([{ type: 'enterApp' }])).toMatchObject({ screen: 'home', showWelcome: false, showSetup: true });
  });
  it('household setup saves size and preferences', () => {
    const st = run([{ type: 'setHousehold', household: '4' }, { type: 'toggleDiet', diet: 'Vegan' }, { type: 'finishSetup' }]);
    expect(st).toMatchObject({ showSetup: false, household: '4', diet: ['Vegan'] });
  });
  it("Cook what’s expiring opens Recipes filtered to it", () => {
    expect(run([{ type: 'setQ', q: 'x' }, { type: 'cookExpiring' }])).toMatchObject({ screen: 'recipes', filters: ['soon'], seg: 'discover', q: '' });
  });
});

describe('impact', () => {
  const cook = (id: string): Action[] => [{ type: 'go', screen: 'recipe', recipeId: id }, { type: 'startCook' }, { type: 'cookNext' }, { type: 'cookNext' }, { type: 'cookNext' }, { type: 'cookNext' }];

  it('updating the pantry after cooking sets the impact', () => {
    expect(run([...cook('frittata'), { type: 'confirmUse' }]).impact).toEqual({ dollars: 2, lbs: 0.5 });
  });
  it('nothing ticked means no impact', () => {
    const st = run(cook('frittata'));
    const none = st.useUp.reduce<AppState>((s, id) => reducer(s, { type: 'toggleUseUp', id }), st);
    expect(reducer(none, { type: 'confirmUse' }).impact).toBeNull();
  });
  it('adding food never sets it', () => {
    expect(run([{ type: 'go', screen: 'manual' }, { type: 'pickFood', name: 'Bread' }, { type: 'addManual' }]).impact).toBeNull();
  });
  it('"I used it" sets it for food at risk; "I tossed it" and food not at risk do not', () => {
    expect(run([{ type: 'go', screen: 'item', itemId: 1 }, { type: 'markItem', kind: 'used' }]).impact).toEqual({ dollars: 1.5, lbs: 1 });
    expect(run([{ type: 'go', screen: 'item', itemId: 1 }, { type: 'markItem', kind: 'tossed' }]).impact).toBeNull();
    expect(run([{ type: 'go', screen: 'item', itemId: 10 }, { type: 'markItem', kind: 'used' }]).impact).toBeNull();
  });
  it('dismissing clears the card and the pop-up', () => {
    const st = run([{ type: 'go', screen: 'item', itemId: 1 }, { type: 'markItem', kind: 'used' }, { type: 'dismissImpact' }]);
    expect(st.impact).toBeNull();
    expect(st.toast.text).toBe('');
  });
});

describe('reducer: items, forms', () => {
  it('manual add trims and resets the form; empty name is a no-op', () => {
    const st0 = createInitialState();
    expect(reducer(st0, { type: 'addManual' })).toBe(st0);
    const st = run([{ type: 'go', screen: 'manual' }, { type: 'setF', patch: { name: ' Spinach ', qty: ' 1 bag ' } }, { type: 'addManual' }]);
    expect(st.pantry.at(-1)).toMatchObject({ id: 20, name: 'Spinach', qty: '1 bag', loc: 'Fridge', days: 5 });
    expect(st.f.name).toBe('');
    expect(st.toast.text).toBe('Spinach added to your pantry');
  });
});

describe('reducer: navigation', () => {
  it('go pushes, back pops, tab clears', () => {
    let st = run([{ type: 'go', screen: 'pantry' }, { type: 'go', screen: 'item', itemId: 3 }]);
    expect(st.stack.map((s) => s.screen)).toEqual(['home', 'pantry']);
    st = reducer(st, { type: 'back' });
    expect(st.screen).toBe('pantry');
    st = reducer(st, { type: 'tab', tab: 'recipes' });
    expect(st).toMatchObject({ screen: 'recipes', stack: [] });
  });
  it('back inside create steps down before leaving', () => {
    let st = run([{ type: 'goCreate' }, { type: 'cNext' }, { type: 'cNext' }]);
    expect(st.cStep).toBe(3);
    st = run([{ type: 'back' }, { type: 'back' }], st);
    expect(st).toMatchObject({ screen: 'create', cStep: 1 });
    expect(reducer(st, { type: 'back' }).screen).toBe('home');
  });
});

describe('reducer: custom place', () => {
  it('validates, then adds and selects the place on the current form', () => {
    let st = run([{ type: 'go', screen: 'manual' }, { type: 'toggleLocForm' }, { type: 'clName', value: 'Garage-fridge' }, { type: 'clAdd' }]);
    expect(st.locForm.err).toBe('Use letters, numbers and spaces only.');
    st = run([{ type: 'clName', value: 'Garage fridge that is very long' }], st);
    expect(st.locForm.name).toBe('Garage fridge that i');
    st = run([{ type: 'clName', value: 'Garage fridge' }, { type: 'clAdd' }], st);
    expect(st.customLocs).toEqual(['Garage fridge']);
    expect(st.f.loc).toBe('Garage fridge');
    expect(st.locForm.open).toBe(false);
  });
  it('custom time on the scan result sets scanDays', () => {
    const st = run([{ type: 'simScan' }, { type: 'toggleDayForm' }, { type: 'cdUnit', unit: 'weeks' }, { type: 'cdNum', value: '2' }, { type: 'cdSet' }]);
    expect(st.scanDays).toBe(14);
  });
});

describe('reducer: items, cooking, goals', () => {
  it('I used it removes the item, counts it, goes back and toasts', () => {
    const st = run([{ type: 'go', screen: 'pantry' }, { type: 'go', screen: 'item', itemId: 1 }, { type: 'markItem', kind: 'used' }]);
    expect(st.pantry.some((p) => p.id === 1)).toBe(false);
    expect(st).toMatchObject({ used: 1, usedIds: [1], screen: 'pantry' });
    expect(st.toast.text).toBe('Nice! Chicken thighs used up.');
  });
  it('finishing cook mode pre-selects used items, confirm removes them', () => {
    let st = run([{ type: 'go', screen: 'recipe', recipeId: 'smoothie' }, { type: 'startCook' }, { type: 'cookNext' }, { type: 'cookNext' }]);
    expect(st.screen).toBe('useup');
    expect(st.cooked).toBe(1);
    expect(st.useUp).toEqual([3]); // Spinach
    st = reducer(st, { type: 'confirmUse' });
    expect(st.toast.text).toBe('Pantry updated. 1 item used up!');
    expect(st.screen).toBe('home');
  });
  it('goals: duplicate and progress', () => {
    let st = run([{ type: 'addGoal', key: 'use5' }]);
    expect(st.toast.text).toBe('Goal added');
    st = reducer(st, { type: 'addGoal', key: 'use5' });
    expect(st.toast.text).toBe('Already on your list');
    expect(st.goals).toHaveLength(1);
  });
  it('save recipe from draft lands on the new recipe and saves it', () => {
    const st = run([
      { type: 'goCreate' }, { type: 'setD', patch: { title: 'Spinach pie' } }, { type: 'cNext' },
      { type: 'setD', patch: { other: 'Spinach' } }, { type: 'addOther' }, { type: 'setAmt', name: 'Spinach', patch: { q: '2', u: 'cup' } },
      { type: 'cNext' }, { type: 'setD', patch: { stepText: 'Bake it' } }, { type: 'addStep' }, { type: 'cNext' }, { type: 'saveRecipe' },
    ]);
    expect(st).toMatchObject({ screen: 'recipe', recipeId: 'mine20', seg: 'mine', saved: ['mine20'] });
    expect(st.mine[0].amts).toEqual([[2, 'cup']]);
  });
  it('toast clear only applies to the latest message', () => {
    const st = run([{ type: 'photoNope' }, { type: 'photoNope' }]);
    expect(reducer(st, { type: 'clearToast', n: 1 }).toast.text).not.toBe('');
    expect(reducer(st, { type: 'clearToast', n: 2 }).toast.text).toBe('');
  });
});

describe('deep links and flags', () => {
  it('share opens the share sheet over the recipe', () => {
    const st = applyDeepLink(createInitialState(), 'share', 'frittata');
    expect(st).toMatchObject({ screen: 'recipe', recipeId: 'frittata', shareFor: 'frittata' });
    expect(reducer(st, { type: 'back' }).screen).toBe('recipes');
  });
  it('unknown recipe id falls back to frittata', () => {
    expect(applyDeepLink(createInitialState(), 'cook', 'nope').recipeId).toBe('frittata');
  });
  it('parses flags with defaults', () => {
    expect(parseFlags('')).toMatchObject({ intro: true, frame: true, screen: null, id: 'frittata' });
    expect(parseFlags('?frame=0&screen=cook&id=smoothie')).toMatchObject({ frame: false, screen: 'cook', id: 'smoothie' });
    expect(parseFlags('?screen=bogus').screen).toBeNull();
  });
});
