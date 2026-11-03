// Which test task the tester is on, for UXtweak. It reads the URL's ?task= value to track progress.
// Pure: the store writes the URL, the screen never shows it.
import { SCAN_GROCERIES, findFood } from './foods';
import type { Action } from './reducer';
import type { AppState, PantryItem, TaskStage } from './types';

const ORDER: TaskStage[] = ['', '1-1', '1-2', '2'];
const later = (a: TaskStage, b: TaskStage) => (ORDER.indexOf(b) > ORDER.indexOf(a) ? b : a);

const isFood = (p: PantryItem, name: string) => findFood(p.name)?.name === name;

/** Task 1 is done once every grocery on the list is in the pantry. */
export const hasGroceries = (pantry: PantryItem[]) => SCAN_GROCERIES.every((g) => pantry.some((p) => isFood(p, g)));

/** Task 2 is done when a cooked recipe's pantry update uses up the spinach. */
const usedSpinach = (before: AppState, a: Action) =>
  a.type === 'confirmUse' && before.pantry.some((p) => before.useUp.includes(p.id) && isFood(p, 'Spinach'));

/** The stage after an action. It only moves forward. */
export function nextTask(before: AppState, a: Action, after: AppState): TaskStage {
  let stage = before.task;
  if (!after.showWelcome) stage = later(stage, '1-1');
  if (stage !== '' && hasGroceries(after.pantry)) stage = later(stage, '1-2');
  if (stage !== '' && usedSpinach(before, a)) stage = later(stage, '2');
  return stage;
}

/** The address for a stage, keeping every other query value. */
export function taskUrl(href: string, stage: TaskStage): string {
  const url = new URL(href);
  if (stage) url.searchParams.set('task', stage);
  else url.searchParams.delete('task');
  return url.pathname + url.search + url.hash;
}
