// One typed action per prototype handler. Mirrors Main.dc.html's setState calls; no DOM or React imports.
import { daysIn, findFood, scanFood, type Food } from './foods';
import { itemImpact, recipeImpact } from './impact';
import { blankDayForm, blankDraft, blankForms, blankLocForm, blankManual } from './seed';
import {
  draftToRecipe, draftView, findRecipe, locations, cookedCandidates, validateDuration, validatePlace,
} from './selectors';
import type {
  Amount, AppState, DayUnit, Diet, Draft, ExpFilter, Goal, GoalKey, ManualForm, PantryItem, RecipeFilter, ScreenName, Seg, TabName, UseKind,
} from './types';

export type Action =
  // navigation
  | { type: 'go'; screen: ScreenName; itemId?: number; recipeId?: string }
  | { type: 'back' }
  | { type: 'tab'; tab: TabName; seg?: Seg }
  | { type: 'openAdd' } | { type: 'closeAdd' }
  // scan + add
  | { type: 'goManualFromScan' } | { type: 'simScan' } | { type: 'rescan' } | { type: 'addScanned' }
  | { type: 'setScanLoc'; loc: string } | { type: 'setScanDays'; days: number }
  | { type: 'setF'; patch: Partial<ManualForm> } | { type: 'pickFood'; name: string } | { type: 'addManual' } | { type: 'doneAdding' }
  | { type: 'toggleLocForm' } | { type: 'clName'; value: string } | { type: 'clCancel' } | { type: 'clAdd' }
  | { type: 'toggleDayForm' } | { type: 'cdNum'; value: string } | { type: 'cdUnit'; unit: DayUnit } | { type: 'cdCancel' } | { type: 'cdSet' }
  // pantry
  | { type: 'togglePFilters' } | { type: 'setLoc'; loc: string } | { type: 'setExp'; exp: ExpFilter } | { type: 'showAll' }
  | { type: 'markItem'; kind: UseKind }
  // recipes
  | { type: 'setQ'; q: string } | { type: 'toggleFilters' } | { type: 'toggleFilter'; key: RecipeFilter } | { type: 'clearFilters' }
  | { type: 'setSeg'; seg: Seg } | { type: 'cookExpiring' }
  | { type: 'toggleSave' }
  | { type: 'openShare' } | { type: 'closeShare' } | { type: 'toggleShareTo'; name: string } | { type: 'sendShare' } | { type: 'copyLink' }
  // cooking
  | { type: 'startCook' } | { type: 'cookPrev' } | { type: 'cookNext' } | { type: 'toggleUseUp'; id: number } | { type: 'confirmUse' }
  // write a recipe
  | { type: 'goCreate' } | { type: 'exitCreate' } | { type: 'cNext' }
  | { type: 'setD'; patch: Partial<Pick<Draft, 'title' | 'time' | 'other' | 'stepText'>> }
  | { type: 'toggleIng'; name: string } | { type: 'setAmt'; name: string; patch: Partial<Amount> }
  | { type: 'addOther' } | { type: 'addStep' } | { type: 'removeStep'; index: number } | { type: 'serves'; delta: 1 | -1 }
  | { type: 'photoNope' } | { type: 'saveRecipe' }
  // me
  | { type: 'toggleRem' } | { type: 'toggleDigest' } | { type: 'setLead'; lead: number }
  | { type: 'toggleDiet'; diet: Diet } | { type: 'saveDiet' }
  | { type: 'addGoal'; key: GoalKey } | { type: 'removeGoal'; key: GoalKey }
  // prototype chrome
  | { type: 'enterApp' } | { type: 'setHousehold'; household: string } | { type: 'finishSetup' }
  | { type: 'replayIntro' } | { type: 'skipOnboard' } | { type: 'nextOnboard' }
  | { type: 'dismissImpact' }
  | { type: 'clearToast'; n: number };

/* ---------- helpers (the prototype's go / back / tab / say) ---------- */

export function go(st: AppState, screen: ScreenName, extra: Partial<AppState> = {}): AppState {
  return {
    ...st,
    stack: st.stack.concat([{ screen: st.screen, itemId: st.itemId, recipeId: st.recipeId, cStep: st.cStep }]),
    screen, nav: 'forward', addSheet: false, addedNow: 0, ...blankForms(), ...extra,
  };
}

export function back(st: AppState): AppState {
  if (st.screen === 'scan' && st.addedNow > 0) return toPantry(st);
  if (st.screen === 'create' && st.cStep > 1) return { ...st, cStep: st.cStep - 1, nav: 'back' };
  if (!st.stack.length) return { ...st, screen: 'home', nav: 'back', ...blankForms() };
  const p = st.stack[st.stack.length - 1];
  return {
    ...st, stack: st.stack.slice(0, -1), screen: p.screen, nav: 'back',
    itemId: p.itemId ?? null, recipeId: p.recipeId ?? null, cStep: p.cStep ?? 1, ...blankForms(),
  };
}

export function tab(st: AppState, t: ScreenName, extra: Partial<AppState> = {}): AppState {
  return { ...st, screen: t, stack: [], nav: 'none', addSheet: false, addedNow: 0, ...blankForms(), ...extra };
}

export const say = (st: AppState, text: string): AppState => ({ ...st, toast: { text, n: st.toast.n + 1 } });

const TAB_SCREEN: Record<TabName, ScreenName> = { home: 'home', pantry: 'pantry', recipes: 'recipes', profile: 'profile' };

const toggle = <T,>(list: T[], v: T) => (list.indexOf(v) >= 0 ? list.filter((x) => x !== v) : list.concat([v]));

function toPantry(st: AppState): AppState {
  return { ...st, screen: 'pantry', stack: [], nav: 'none', loc: 'All', exp: 'any', f: blankManual(), addedNow: 0, ...blankForms() };
}

function addItem(st: AppState, item: Omit<PantryItem, 'id'>, extra: Partial<AppState>): AppState {
  return say({
    ...st, pantry: st.pantry.concat([{ id: st.nextId, ...item }]), nextId: st.nextId + 1,
    addedNow: st.addedNow + 1, ...blankForms(), ...extra,
  }, item.name + ' added to your pantry');
}

const scanned = (food: Food, loc: string, days: number) => ({ name: food.name, qty: food.qty, loc, days });

/** Changing place moves the days to that food's timeline, unless the tester chose the days by hand. */
function formWithPlace(f: ManualForm, loc: string): ManualForm {
  const days = f.daysSet ? null : daysIn(findFood(f.name), loc);
  return { ...f, loc, days: days ?? f.days };
}

function scanWithPlace(st: AppState, loc: string): AppState {
  const days = st.scanDaysSet ? null : daysIn(scanFood(st.scanIdx), loc);
  return { ...st, scanLoc: loc, scanDays: days ?? st.scanDays };
}

function pickLoc(st: AppState, v: string): AppState {
  return st.screen === 'scanResult' ? scanWithPlace(st, v) : { ...st, f: formWithPlace(st.f, v) };
}

function pickDays(st: AppState, v: number): AppState {
  return st.screen === 'scanResult' ? { ...st, scanDays: v, scanDaysSet: true } : { ...st, f: { ...st.f, days: v, daysSet: true } };
}

function toggleIng(d: Draft, name: string): Draft {
  const on = d.ings.indexOf(name) >= 0, amts = { ...d.amts };
  if (on) delete amts[name]; else amts[name] = { q: '1', u: 'whole' };
  return { ...d, ings: on ? d.ings.filter((x) => x !== name) : d.ings.concat([name]), amts };
}

function markShared(st: AppState): AppState {
  const id = st.shareFor;
  return { ...st, shared: id === null || st.shared.indexOf(id) >= 0 ? st.shared : st.shared.concat([id]), shareFor: null };
}

function addGoal(st: AppState, key: GoalKey): AppState {
  if (st.goals.some((g) => g.key === key)) return say(st, 'Already on your list');
  let goal: Goal;
  if (key === 'soon') {
    const items = st.pantry.filter((p) => p.days <= 3);
    if (!items.length) return say(st, 'Nothing is expiring soon right now');
    goal = { key, snap: items.map((p) => p.id), names: items.map((p) => p.name) };
  } else {
    goal = { key, base: key === 'use5' ? st.usedIds.length : st.cooked };
  }
  return say({ ...st, goals: st.goals.concat([goal]) }, 'Goal added');
}

/* ---------- reducer ---------- */

export function reducer(st: AppState, a: Action): AppState {
  switch (a.type) {
    case 'go': {
      const extra: Partial<AppState> = {};
      if (a.itemId !== undefined) extra.itemId = a.itemId;
      if (a.recipeId !== undefined) extra.recipeId = a.recipeId;
      return go(st, a.screen, extra);
    }
    case 'back': return back(st);
    case 'tab': return tab(st, TAB_SCREEN[a.tab], a.seg ? { seg: a.seg } : {});
    case 'openAdd': return { ...st, addSheet: true };
    case 'closeAdd': return { ...st, addSheet: false };

    case 'goManualFromScan': return { ...st, screen: 'manual', ...blankForms() };
    case 'simScan': {
      const food = scanFood(st.scanIdx);
      return { ...st, screen: 'scanResult', scanLoc: food.loc, scanDays: daysIn(food, food.loc) ?? 5, scanDaysSet: false, ...blankForms() };
    }
    case 'rescan': return { ...st, screen: 'scan', ...blankForms() };
    case 'addScanned':
      return addItem(st, scanned(scanFood(st.scanIdx), st.scanLoc, st.scanDays), { screen: 'scan', scanIdx: st.scanIdx + 1 });
    case 'setScanLoc': return scanWithPlace(st, a.loc);
    case 'setScanDays': return pickDays(st, a.days);
    case 'setF': {
      const f = { ...st.f, ...a.patch, daysSet: st.f.daysSet || a.patch.days !== undefined };
      return { ...st, f: a.patch.loc ? formWithPlace(f, a.patch.loc) : f };
    }
    case 'pickFood': {
      const food = findFood(a.name);
      if (!food) return { ...st, f: { ...st.f, name: a.name } };
      return { ...st, f: { ...st.f, name: food.name, qty: food.qty, loc: food.loc, days: daysIn(food, food.loc) ?? st.f.days, daysSet: false, picked: food.name } };
    }
    case 'addManual': {
      const name = st.f.name.trim();
      if (!name) return st;
      return addItem(st, { name, qty: st.f.qty.trim(), loc: st.f.loc, days: st.f.days }, { f: blankManual() });
    }
    case 'doneAdding': return toPantry(st);

    case 'toggleLocForm': return { ...st, locForm: { open: !st.locForm.open, name: '', err: '' } };
    case 'clName': return { ...st, locForm: { ...st.locForm, name: a.value.slice(0, 20), err: '' } };
    case 'clCancel': return { ...st, locForm: blankLocForm() };
    case 'clAdd': {
      const { value, err } = validatePlace(st.locForm.name, locations(st));
      if (err) return { ...st, locForm: { ...st.locForm, err } };
      return pickLoc({ ...st, customLocs: st.customLocs.concat([value]), locForm: blankLocForm() }, value);
    }
    case 'toggleDayForm': return { ...st, dayForm: { open: !st.dayForm.open, num: '', unit: 'days', err: '' } };
    case 'cdNum': return { ...st, dayForm: { ...st.dayForm, num: a.value, err: '' } };
    case 'cdUnit': return { ...st, dayForm: { ...st.dayForm, unit: a.unit, err: '' } };
    case 'cdCancel': return { ...st, dayForm: blankDayForm() };
    case 'cdSet': {
      const { days, err } = validateDuration(st.dayForm.num, st.dayForm.unit);
      if (err) return { ...st, dayForm: { ...st.dayForm, err } };
      return pickDays({ ...st, dayForm: blankDayForm() }, days);
    }

    case 'togglePFilters': return { ...st, pFiltersOpen: !st.pFiltersOpen };
    case 'setLoc': return { ...st, loc: a.loc };
    case 'setExp': return { ...st, exp: a.exp };
    case 'showAll': return { ...st, loc: 'All', exp: 'any' };
    case 'markItem': {
      const p = st.pantry.find((x) => x.id === st.itemId);
      if (!p) return st;
      const removed: AppState = {
        ...st,
        pantry: st.pantry.filter((x) => x.id !== p.id),
        used: st.used + (a.kind === 'used' ? 1 : 0), tossed: st.tossed + (a.kind === 'tossed' ? 1 : 0),
        usedIds: a.kind === 'used' && st.usedIds.indexOf(p.id) < 0 ? st.usedIds.concat([p.id]) : st.usedIds,
      };
      const impact = a.kind === 'used' ? itemImpact(p) : null;
      return say({ ...back(removed), impact }, a.kind === 'used' ? 'Nice! ' + p.name + ' used up.' : p.name + ' removed.');
    }

    case 'setQ': return { ...st, q: a.q };
    case 'toggleFilters': return { ...st, filtersOpen: !st.filtersOpen };
    case 'toggleFilter': return { ...st, filters: toggle(st.filters, a.key) };
    case 'clearFilters': return { ...st, filters: [] };
    case 'setSeg': return { ...st, seg: a.seg };
    case 'cookExpiring': return tab(st, 'recipes', { seg: 'discover', q: '', filters: ['soon'], filtersOpen: false });
    case 'toggleSave': {
      if (st.recipeId === null) return st;
      const on = st.saved.indexOf(st.recipeId) >= 0;
      return say({ ...st, saved: toggle(st.saved, st.recipeId) }, on ? 'Removed from saved' : 'Saved to Recipes › Saved');
    }
    case 'openShare': return { ...st, shareFor: st.recipeId, shareTo: [] };
    case 'closeShare': return { ...st, shareFor: null };
    case 'toggleShareTo': return { ...st, shareTo: toggle(st.shareTo, a.name) };
    case 'sendShare': return say(markShared(st), 'Sent to ' + st.shareTo.join(' & ') + ' (pretend)');
    case 'copyLink': return say(markShared(st), 'Link copied (pretend)');

    case 'startCook': return go(st, 'cook', { cookStep: 0 });
    case 'cookPrev': return { ...st, cookStep: Math.max(0, st.cookStep - 1) };
    case 'cookNext': {
      const steps = findRecipe(st, st.recipeId)?.steps ?? [''];
      if (st.cookStep >= steps.length - 1) {
        return { ...st, screen: 'useup', nav: 'forward', useUp: cookedCandidates(st).map((p) => p.id), cooked: st.cooked + 1 };
      }
      return { ...st, cookStep: st.cookStep + 1 };
    }
    case 'toggleUseUp': return { ...st, useUp: toggle(st.useUp, a.id) };
    case 'confirmUse': {
      const n = st.useUp.length;
      const next: AppState = {
        ...st,
        pantry: st.pantry.filter((p) => st.useUp.indexOf(p.id) < 0),
        used: st.used + n,
        usedIds: st.usedIds.concat(st.useUp.filter((id) => st.usedIds.indexOf(id) < 0)),
        useUp: [], screen: 'home', stack: [], nav: 'none', impact: recipeImpact(st, st.useUp),
      };
      return say(next, n ? 'Pantry updated. ' + n + ' item' + (n > 1 ? 's' : '') + ' used up!' : 'Nothing changed');
    }

    case 'goCreate': return go(st, 'create', { cStep: 1, d: blankDraft() });
    case 'exitCreate': {
      const stack = st.stack.slice();
      let p = stack.pop();
      while (p && p.screen === 'create') p = stack.pop();
      return { ...st, stack, screen: p ? p.screen : 'home', itemId: p?.itemId ?? null, recipeId: p?.recipeId ?? null };
    }
    case 'cNext': return { ...st, cStep: Math.min(4, st.cStep + 1) };
    case 'setD': return { ...st, d: { ...st.d, ...a.patch } };
    case 'toggleIng': return { ...st, d: toggleIng(st.d, a.name) };
    case 'setAmt': {
      const amts = { ...st.d.amts };
      amts[a.name] = { ...(amts[a.name] ?? { q: '1', u: 'whole' }), ...a.patch };
      return { ...st, d: { ...st.d, amts } };
    }
    case 'addOther': {
      const v = st.d.other.trim();
      if (!v || st.d.ings.indexOf(v) >= 0) return st;
      return { ...st, d: { ...toggleIng(st.d, v), other: '' } };
    }
    case 'addStep': {
      const v = st.d.stepText.trim();
      if (!v) return st;
      return { ...st, d: { ...st.d, steps: st.d.steps.concat([v]), stepText: '' } };
    }
    case 'removeStep': return { ...st, d: { ...st.d, steps: st.d.steps.filter((_, j) => j !== a.index) } };
    case 'serves': return { ...st, d: { ...st.d, serves: Math.min(12, Math.max(1, st.d.serves + a.delta)) } };
    case 'photoNope': return say(st, 'Photos are not part of this prototype yet');
    case 'saveRecipe': {
      if (draftView(st.d, st.cStep).anyBad) return st;
      const id = 'mine' + st.nextId;
      const r = draftToRecipe(st.d, id);
      return say({
        ...st, mine: st.mine.concat([r]), saved: st.saved.concat([id]), nextId: st.nextId + 1,
        screen: 'recipe', recipeId: id, stack: [{ screen: 'recipes' }], seg: 'mine',
      }, 'Saved to My recipes');
    }

    case 'toggleRem': return { ...st, reminders: !st.reminders };
    case 'toggleDigest': return { ...st, digest: !st.digest };
    case 'setLead': return { ...st, lead: a.lead };
    case 'toggleDiet': return { ...st, diet: toggle(st.diet, a.diet) };
    case 'saveDiet': return say(back(st), 'Preferences saved');
    case 'addGoal': return addGoal(st, a.key);
    case 'removeGoal': return { ...st, goals: st.goals.filter((g) => g.key !== a.key) };

    case 'enterApp': return { ...st, showWelcome: false, showSetup: true };
    case 'setHousehold': return { ...st, household: a.household };
    case 'finishSetup': return { ...st, showSetup: false };
    case 'replayIntro': return { ...st, onboard: 1 };
    case 'skipOnboard': return { ...st, onboard: 0 };
    case 'nextOnboard': return { ...st, onboard: st.onboard >= 3 ? 0 : st.onboard + 1 };
    case 'dismissImpact': return { ...st, impact: null, toast: { ...st.toast, text: '' } };
    case 'clearToast': return a.n === st.toast.n ? { ...st, toast: { ...st.toast, text: '' } } : st;
  }
}
