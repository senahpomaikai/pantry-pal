import { describe, expect, it } from 'vitest';
import { reducer, type Action } from './reducer';
import { createInitialState } from './seed';
import { hasGroceries, nextTask, taskUrl } from './task';
import type { AppState } from './types';

/** Runs actions through the reducer the way the store does, tracking the task. */
const run = (st: AppState, ...actions: Action[]) =>
  actions.reduce((s, a) => {
    const next = reducer(s, a);
    return { ...next, task: nextTask(s, a, next) };
  }, st);

const groceries = (st: AppState) =>
  run(st, ...['Whole milk', 'Yogurt', 'Strawberries', 'Ground beef', 'Bread'].flatMap((name): Action[] => [
    { type: 'setF', patch: { name } }, { type: 'addManual' },
  ]));

const cookFrittata = (st: AppState, ...extra: Action[]) =>
  run(st, { type: 'go', screen: 'recipe', recipeId: 'frittata' }, { type: 'startCook' },
    ...Array.from({ length: 4 }, (): Action => ({ type: 'cookNext' })), ...extra, { type: 'confirmUse' });

describe('task tracking', () => {
  const start = createInitialState();

  it('starts on the welcome screen, then Task 1', () => {
    expect(start.task).toBe('');
    expect(run(start, { type: 'setHousehold', household: '3' }).task).toBe('');
    expect(run(start, { type: 'enterApp' }).task).toBe('1');
  });
  it('moves to Task 2 once all five groceries are in, typed or scanned', () => {
    const inApp = run(start, { type: 'enterApp' });
    const four = run(inApp, { type: 'setF', patch: { name: 'Milk' } }, { type: 'addManual' });
    expect(four.task).toBe('1');
    expect(groceries(inApp).task).toBe('2');
    const scanned = run(inApp, ...Array.from({ length: 5 }, (): Action[] => [{ type: 'simScan' }, { type: 'addScanned' }]).flat());
    expect(scanned.task).toBe('2');
  });
  it('is done when a cooked recipe uses up the spinach', () => {
    const t2 = groceries(run(start, { type: 'enterApp' }));
    expect(cookFrittata(t2).task).toBe('done');
  });
  it('is not done if the spinach is left unticked, or used without cooking', () => {
    const t2 = groceries(run(start, { type: 'enterApp' }));
    expect(cookFrittata(t2, { type: 'toggleUseUp', id: 3 }).task).toBe('2');
    expect(run(t2, { type: 'go', screen: 'item', itemId: 3 }, { type: 'markItem', kind: 'used' }).task).toBe('2');
  });
  it('only moves forward', () => {
    const t2 = groceries(run(start, { type: 'enterApp' }));
    const bread = t2.pantry.find((p) => p.name === 'Bread')!;
    expect(run(t2, { type: 'go', screen: 'item', itemId: bread.id }, { type: 'markItem', kind: 'tossed' }).task).toBe('2');
  });
  it('still records Task 2 if a grocery was missed', () => {
    expect(cookFrittata(run(start, { type: 'enterApp' })).task).toBe('done');
  });
  it('knows the grocery list', () => {
    expect(hasGroceries(start.pantry)).toBe(false);
    expect(hasGroceries(groceries(start).pantry)).toBe(true);
  });
});

describe('task URL', () => {
  it('sets and clears ?task=, keeping everything else', () => {
    expect(taskUrl('https://x.io/pantry-pal/B/', '1')).toBe('/pantry-pal/B/?task=1');
    expect(taskUrl('https://x.io/pantry-pal/B/?task=1', '2')).toBe('/pantry-pal/B/?task=2');
    expect(taskUrl('https://x.io/pantry-pal/A/?intro=0&task=2', 'done')).toBe('/pantry-pal/A/?intro=0&task=done');
    expect(taskUrl('https://x.io/pantry-pal/A/?task=2#x', '')).toBe('/pantry-pal/A/#x');
  });
});
