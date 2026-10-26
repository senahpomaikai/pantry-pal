import { describe, expect, it } from 'vitest';
import { applyDeepLink } from './deeplink';
import { reducer, type Action } from './reducer';
import { createInitialState } from './seed';
import { task } from './selectors';
import type { AppState } from './types';
import { parseFlags } from '../variants';

const run = (actions: Action[], st: AppState = createInitialState()) => actions.reduce(reducer, st);

describe('reducer: core test task', () => {
  it('scan -> add spinach -> save -> share completes 3 of 3', () => {
    let st = run([{ type: 'go', screen: 'scan' }, { type: 'simScan' }, { type: 'addScanned' }]);
    expect(st.screen).toBe('pantry');
    expect(st.toast.text).toBe('Baby spinach added to your pantry');
    expect(task(st).done).toBe(1);

    st = run([{ type: 'go', screen: 'recipe', recipeId: 'frittata' }, { type: 'toggleSave' }], st);
    expect(st.toast.text).toBe('Saved to Recipes › Saved');
    expect(task(st).done).toBe(2);

    st = run([{ type: 'openShare' }, { type: 'toggleShareTo', name: 'Maya' }, { type: 'toggleShareTo', name: 'Sam' }, { type: 'sendShare' }], st);
    expect(st.toast.text).toBe('Sent to Maya & Sam (pretend)');
    expect(st.shareFor).toBeNull();
    expect(task(st).done).toBe(3);
  });

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
    expect(st.useUp).toEqual([3]); // Milk
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
    expect(task(st).g2).toBe(true);
  });
  it('toast clear only applies to the latest message', () => {
    const st = run([{ type: 'photoNope' }, { type: 'photoNope' }]);
    expect(reducer(st, { type: 'clearToast', n: 1 }).toast.text).not.toBe('');
    expect(reducer(st, { type: 'clearToast', n: 2 }).toast.text).toBe('');
  });
});

describe('deep links and flags', () => {
  it('share opens the share sheet over the recipe', () => {
    const st = applyDeepLink(createInitialState(), 'share', 'frittata', 'home');
    expect(st).toMatchObject({ screen: 'recipe', recipeId: 'frittata', shareFor: 'frittata' });
    expect(reducer(st, { type: 'back' }).screen).toBe('recipes');
  });
  it('unknown recipe id falls back to frittata', () => {
    expect(applyDeepLink(createInitialState(), 'cook', 'nope', 'home').recipeId).toBe('frittata');
  });
  it('parses flags with defaults and remembers the variant', () => {
    const mem = new Map<string, string>();
    const store = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
    expect(parseFlags('', store)).toMatchObject({ variant: 'a', task: true, intro: true, frame: true, screen: null, id: 'frittata' });
    expect(parseFlags('?v=b&task=0&frame=0&screen=cook&id=smoothie', store)).toMatchObject({ variant: 'b', task: false, frame: false, screen: 'cook', id: 'smoothie' });
    expect(parseFlags('', store).variant).toBe('b');
    expect(parseFlags('?screen=bogus').screen).toBeNull();
  });
});
