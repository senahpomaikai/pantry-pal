// Pure functions ported from the prototype's helper methods and render(). No DOM or React imports.
import { GOALS, LOCS, ONBOARDING, RECIPES } from './seed';
import type {
  AppState, Diet, Draft, DayUnit, ExpFilter, Goal, PantryItem, Recipe, RecipeFilter, ScreenName, TabName, Unit,
} from './types';

export interface AmountCheck { num: number; bad: boolean }

/* ---------- matching ---------- */

/** Loose ingredient match: equal, or either name contains the other (case-insensitive). */
export function match(a: string, b: string): boolean {
  a = a.toLowerCase();
  b = b.toLowerCase();
  return a === b || a.includes(b) || b.includes(a);
}

export const pItem = (pantry: PantryItem[], ing: string) => pantry.find((p) => match(p.name, ing));
export const has = (pantry: PantryItem[], ing: string) => !!pItem(pantry, ing);
export const soon = (pantry: PantryItem[], ing: string) => {
  const p = pItem(pantry, ing);
  return !!p && p.days <= 3;
};

export const allRecipes = (st: Pick<AppState, 'mine'>): Recipe[] => RECIPES.concat(st.mine);
export const findRecipe = (st: Pick<AppState, 'mine'>, id: string | null) => allRecipes(st).find((r) => r.id === id);

export function usesSpinach(st: Pick<AppState, 'mine'>, id: string): boolean {
  const r = findRecipe(st, id);
  return !!r && r.ings.some((i) => i.toLowerCase().includes('spinach'));
}

/* ---------- test task ---------- */

export interface TaskProgress { g1: boolean; g2: boolean; g3: boolean; done: number }

export function task(st: Pick<AppState, 'pantry' | 'saved' | 'shared' | 'mine'>): TaskProgress {
  const g1 = st.pantry.some((p) => p.name.toLowerCase().includes('spinach'));
  const g2 = st.saved.some((id) => usesSpinach(st, id));
  const g3 = st.shared.some((id) => usesSpinach(st, id));
  return { g1, g2, g3, done: [g1, g2, g3].filter(Boolean).length };
}

export function taskRows(g: TaskProgress) {
  return [
    { done: g.g1, text: 'Get spinach into your pantry', hint: 'Scan it or type it in.' },
    { done: g.g2, text: 'Save a recipe that uses spinach', hint: 'Find one, or write your own.' },
    { done: g.g3, text: 'Share that recipe with a friend', hint: 'Look for the share icon.' },
  ];
}

/* ---------- formatting ---------- */

export function expLabel(d: number): string {
  if (d <= 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d <= 10) return d + ' days';
  if (d <= 60) return Math.round(d / 7) + ' wks';
  return 'Months';
}

export function dayFmt(v: number): string {
  if (v < 7) return v + (v === 1 ? ' day' : ' days');
  if (v % 30 === 0) { const m = v / 30; return m + (m === 1 ? ' month' : ' months'); }
  if (v % 7 === 0) { const w = v / 7; return w + (w === 1 ? ' week' : ' weeks'); }
  return v + ' days';
}

const FRACTIONS: Record<string, string> = { 0.25: '1/4', 0.33: '1/3', 0.5: '1/2', 0.67: '2/3', 0.75: '3/4' };

export function fmtNum(q: number): string {
  const w = Math.floor(q), f = Math.round((q - w) * 100) / 100;
  if (!f) return String(w);
  if (FRACTIONS[f]) return (w ? w + ' ' : '') + FRACTIONS[f];
  return String(Math.round(q * 100) / 100);
}

const PLURALS: Partial<Record<Unit, string>> = { cup: 'cups', clove: 'cloves', pinch: 'pinches' };

export function fmtAmt(q: number, u: Unit): string {
  const n = fmtNum(q);
  if (u === 'whole') return n + ' whole';
  return n + ' ' + (q > 1 && PLURALS[u] ? PLURALS[u] : u);
}

/** Preset day options, plus the current value if it is a custom one. */
export function dayOpts(presets: number[], cur: number): number[] {
  const o = presets.slice();
  if (o.indexOf(cur) < 0) o.push(cur);
  return o;
}

export const leadLabel = (v: number) => (v === 1 ? '1 day before' : v + ' days before');

/* ---------- navigation ---------- */

const TAB_GROUP: Partial<Record<ScreenName, TabName>> = {
  home: 'home', notifs: 'home', help: 'home',
  pantry: 'pantry', item: 'pantry', manual: 'pantry', scanResult: 'pantry',
  recipes: 'recipes', recipe: 'recipes',
  profile: 'profile', goals: 'profile', shared: 'profile', reminders: 'profile', diet: 'profile',
};

export const tabGroup = (screen: ScreenName): TabName | '' => TAB_GROUP[screen] ?? '';
export const showTabs = (screen: ScreenName) => ['scan', 'cook', 'create', 'useup'].indexOf(screen) < 0;

/* ---------- pantry ---------- */

export const locations = (st: Pick<AppState, 'customLocs'>) => LOCS.concat(st.customLocs);
export const sortedPantry = (pantry: PantryItem[]) => pantry.slice().sort((a, b) => a.days - b.days);

export interface PantryRow extends PantryItem { exp: string; soon: boolean; tagCls: string; sub: string }

export const pantryRow = (p: PantryItem): PantryRow => ({
  ...p, exp: expLabel(p.days), soon: p.days <= 3, tagCls: p.days <= 3 ? 'warn' : '', sub: p.loc + (p.qty ? ' · ' + p.qty : ''),
});

export const soonItems = (pantry: PantryItem[]) => sortedPantry(pantry).filter((p) => p.days <= 3).map(pantryRow);

export const EXP_OPTIONS: [ExpFilter, string][] = [['any', 'Any time'], ['soon', 'Expiring soon'], ['week', 'This week'], ['later', 'Later']];

export function expOk(exp: ExpFilter, days: number): boolean {
  return exp === 'any' || (exp === 'soon' ? days <= 3 : exp === 'week' ? days <= 7 : days > 7);
}

export function pantryRows(st: Pick<AppState, 'pantry' | 'loc' | 'exp'>): PantryRow[] {
  return sortedPantry(st.pantry).filter((p) => (st.loc === 'All' || p.loc === st.loc) && expOk(st.exp, p.days)).map(pantryRow);
}

/** Active pantry filter labels, e.g. ['Fridge', 'Expiring soon']. */
export function pantryFilterParts(st: Pick<AppState, 'loc' | 'exp'>): string[] {
  const parts: string[] = [];
  if (st.loc !== 'All') parts.push(st.loc);
  if (st.exp !== 'any') parts.push(EXP_OPTIONS.find((e) => e[0] === st.exp)![1]);
  return parts;
}

/* ---------- recipes ---------- */

export interface RecipeCard extends Recipe {
  have: number; total: number; full: boolean; matchText: string; usesSoon: boolean; soonText: string; timeText: string;
}

export function recipeCard(pantry: PantryItem[], r: Recipe): RecipeCard {
  const have = r.ings.filter((i) => has(pantry, i)).length;
  const soonList = r.ings.filter((i) => soon(pantry, i));
  const full = have === r.ings.length;
  return {
    ...r, have, total: r.ings.length, full,
    matchText: full ? 'You have everything' : 'You have ' + have + ' of ' + r.ings.length,
    usesSoon: soonList.length > 0,
    soonText: soonList.length ? 'Uses up ' + soonList.join(', ').toLowerCase() : '',
    timeText: r.time + ' min',
  };
}

const score = (c: RecipeCard) => c.have / c.total + (c.usesSoon ? 0.3 : 0);

export function topRecipes(st: Pick<AppState, 'pantry'>): RecipeCard[] {
  const own = RECIPES.filter((r) => !r.friend).map((r) => recipeCard(st.pantry, r));
  return own.sort((a, b) => score(b) - score(a)).slice(0, 3);
}

export const RECIPE_FILTERS: [RecipeFilter, string][] = [
  ['soon', 'Uses what’s expiring'], ['quick', '20 min or less'], ['ready', 'I have everything'], ['diet', 'Fits my food preferences'],
];

export function applyRecipeFilters(list: RecipeCard[], filters: RecipeFilter[], diet: Diet[]): RecipeCard[] {
  if (filters.indexOf('soon') >= 0) list = list.filter((r) => r.usesSoon);
  if (filters.indexOf('quick') >= 0) list = list.filter((r) => r.time <= 20);
  if (filters.indexOf('ready') >= 0) list = list.filter((r) => r.full);
  if (filters.indexOf('diet') >= 0 && diet.length) list = list.filter((r) => diet.every((p) => (r.diet || []).indexOf(p) >= 0));
  return list;
}

export function recipeList(st: Pick<AppState, 'seg' | 'saved' | 'mine' | 'q' | 'filters' | 'diet' | 'pantry'>) {
  const F = st.filters;
  const base = st.seg === 'discover'
    ? RECIPES.filter((r) => !r.friend)
    : st.seg === 'saved' ? st.saved.map((id) => findRecipe(st, id)).filter((r): r is Recipe => !!r) : st.mine;
  let list = base.map((r) => recipeCard(st.pantry, r));
  const q = st.q.trim().toLowerCase();
  if (q && st.seg !== 'mine') list = list.filter((r) => r.title.toLowerCase().includes(q) || r.ings.some((i) => i.toLowerCase().includes(q)));
  if (st.seg !== 'mine') list = applyRecipeFilters(list, F, st.diet);
  if (st.seg === 'discover') list.sort((a, b) => b.have / b.total - a.have / a.total);

  let emptyTitle = 'No matches', emptyText = F.length ? 'Try clearing a filter.' : 'Try a different search.';
  if (!q && !F.length && st.seg === 'saved') { emptyTitle = 'No saved recipes yet'; emptyText = 'Tap the bookmark on a recipe to keep it here.'; }
  if (st.seg === 'mine') { emptyTitle = 'No recipes of your own yet'; emptyText = 'Write one to keep and share it.'; }
  return { list, emptyTitle, emptyText };
}

export function recipeDetail(st: AppState) {
  const rr = findRecipe(st, st.recipeId);
  if (!rr) return null;
  const c = recipeCard(st.pantry, rr);
  const saved = st.saved.indexOf(rr.id) >= 0;
  return {
    ...c, saved,
    haveLine: c.full ? 'You have all ' + c.total + ' ingredients' : 'You have ' + c.have + ' of ' + c.total + ' ingredients',
    ingRows: rr.ings.map((i, k) => {
      const hv = has(st.pantry, i), sn = soon(st.pantry, i), a = rr.amts && rr.amts[k];
      return { name: i, amt: a ? fmtAmt(a[0], a[1]) : '', on: hv, note: hv ? (sn ? 'use soon' : 'in pantry') : 'need to buy', noteCls: sn ? 'warn-text' : 'muted' };
    }),
    stepRows: rr.steps.map((t, i) => ({ n: i + 1, t })),
  };
}

export function cookView(st: AppState) {
  const rr = findRecipe(st, st.recipeId);
  const steps = rr ? rr.steps : [''];
  return {
    n: st.cookStep + 1, total: steps.length, text: steps[st.cookStep] || '', first: st.cookStep === 0,
    last: st.cookStep >= steps.length - 1,
    pct: Math.round((st.cookStep + 1) / steps.length * 100) + '%',
    nextLabel: st.cookStep >= steps.length - 1 ? 'I’m done cooking' : 'Next step',
  };
}

/** Pantry items the current recipe uses: the "What did you use up?" candidates. */
export function cookedCandidates(st: AppState): PantryItem[] {
  const rr = findRecipe(st, st.recipeId);
  return rr ? st.pantry.filter((p) => rr.ings.some((i) => match(i, p.name))) : [];
}

/* ---------- pantry item ---------- */

export function itemView(st: AppState) {
  const ip = st.pantry.find((p) => p.id === st.itemId);
  if (!ip) return null;
  return {
    ...pantryRow(ip),
    lower: ip.name.toLowerCase(),
    expLong: ip.days <= 1 ? 'Expires ' + expLabel(ip.days).toLowerCase() : 'Good for ' + expLabel(ip.days),
    recipes: allRecipes(st).filter((r) => r.ings.some((i) => match(i, ip.name))).map((r) => recipeCard(st.pantry, r)),
  };
}

/* ---------- custom place / time validation ---------- */

/** Normalises and validates a custom storage place. Returns the cleaned name or an error message. */
export function validatePlace(raw: string, existing: string[]): { value: string; err: string } {
  const v = raw.trim().replace(/\s+/g, ' ');
  let err = '';
  if (!v) err = 'Type a name for the place.';
  else if (v.length > 20) err = 'Use 20 characters or fewer.';
  else if (!/^[A-Za-z0-9 ]+$/.test(v)) err = 'Use letters, numbers and spaces only.';
  else if (['All'].concat(existing).some((x) => x.toLowerCase() === v.toLowerCase())) err = '“' + v + '” is already on the list.';
  return { value: v, err };
}

const UNIT_MAX: Record<DayUnit, number> = { days: 365, weeks: 52, months: 12 };
const UNIT_DAYS: Record<DayUnit, number> = { days: 1, weeks: 7, months: 30 };

/** Validates a custom shelf life. Returns the length in days or an error message. */
export function validateDuration(num: string, unit: DayUnit): { days: number; err: string } {
  const n = Number(num), max = UNIT_MAX[unit];
  if (num === '' || !Number.isInteger(n) || n < 1 || n > max) return { days: 0, err: 'Enter a whole number from 1 to ' + max + ' ' + unit + '.' };
  return { days: n * UNIT_DAYS[unit], err: '' };
}

/* ---------- recipe draft ---------- */

export function checkAmount(q: string): AmountCheck {
  const num = Number(q);
  return { num, bad: !(q !== '' && isFinite(num) && num > 0 && num <= 999) };
}

export function draftIngRows(d: Draft) {
  return d.ings.map((n, i) => {
    const a = d.amts[n] || { q: '1', u: 'whole' as Unit };
    const { num, bad } = checkAmount(a.q);
    return { name: n, q: a.q, u: a.u, bad, i, label: bad ? n : n + ' · ' + fmtAmt(num, a.u) };
  });
}

export const STEP_NAMES = ['', 'Basics', 'Ingredients', 'Steps', 'Review'];

export function draftView(d: Draft, cStep: number) {
  const rows = draftIngRows(d);
  const anyBad = rows.some((r) => r.bad);
  const noIngs = d.ings.length === 0;
  return {
    rows, step: cStep, stepName: STEP_NAMES[cStep], pct: cStep * 25 + '%',
    noTitle: !d.title.trim(), noOther: !d.other.trim(), hasIngs: !noIngs, blockIngs: noIngs || anyBad, anyBad,
    blockText: noIngs ? 'Pick at least one ingredient' : 'Fix the amounts above to continue',
    noSteps: d.steps.length === 0, noStepText: !d.stepText.trim(),
    ingCount: d.ings.length, stepCount: d.steps.length, nextStepN: d.steps.length + 1, timeText: d.time + ' min',
  };
}

/** Builds the saved recipe from a draft (amounts become numbers). */
export function draftToRecipe(d: Draft, id: string): Recipe {
  return {
    id, title: d.title.trim(), time: d.time, serves: d.serves, by: 'You', diet: [], ings: d.ings,
    amts: d.ings.map((n) => { const a = d.amts[n] || { q: '1', u: 'whole' }; return [Number(a.q), a.u]; }),
    steps: d.steps,
  };
}

/* ---------- goals ---------- */

export function goalView(st: Pick<AppState, 'usedIds' | 'cooked'>, g: Goal) {
  const P = GOALS.find((x) => x.key === g.key)!;
  let have: number, target: number, sub = P.sub;
  if (g.key === 'soon') { target = g.snap.length; have = g.snap.filter((id) => st.usedIds.indexOf(id) >= 0).length; sub = g.names.join(', '); }
  else if (g.key === 'use5') { target = 5; have = Math.min(5, st.usedIds.length - g.base); }
  else { target = 3; have = Math.min(3, st.cooked - g.base); }
  return {
    key: g.key, title: P.title, sub, have, target, done: have >= target,
    pct: Math.round(have / target * 100) + '%', progText: have + ' of ' + target,
  };
}

export function homeGoal(st: Pick<AppState, 'goals' | 'usedIds' | 'cooked'>) {
  const cards = st.goals.map((g) => goalView(st, g));
  if (!cards.length) return { title: 'Set a goal', right: '' };
  const done = cards.filter((x) => x.done).length;
  return { title: 'My goals', right: cards.length === 1 ? cards[0].progText : done + ' of ' + cards.length + ' done' };
}

export const goalPresets = (st: Pick<AppState, 'goals'>) => GOALS.filter((p) => !st.goals.some((x) => x.key === p.key));

/* ---------- notifications, sharing ---------- */

export type NotifTarget = { itemId: number } | { recipeId: string };

export function notifRows(pantry: PantryItem[]) {
  return soonItems(pantry)
    .map((p) => ({
      title: p.name + (p.days <= 1 ? ' expires ' + p.exp.toLowerCase() : ' expires in ' + p.exp),
      sub: '', isWarn: true, target: { itemId: p.id } as NotifTarget,
    }))
    .concat([{ title: 'Maya shared a recipe', sub: 'Lemon Orzo with Greens', isWarn: false, target: { recipeId: 'orzo' } }]);
}

export const friendRecipes = (pantry: PantryItem[]) => RECIPES.filter((r) => r.friend).map((r) => recipeCard(pantry, r));

export const sentRecipes = (st: Pick<AppState, 'shared' | 'mine'>) =>
  st.shared.map((id) => findRecipe(st, id)).filter((r): r is Recipe => !!r);

export const sendLabel = (n: number) => (n ? 'Send to ' + n + (n > 1 ? ' friends' : ' friend') : 'Pick someone to send to');

/* ---------- onboarding ---------- */

export function onboardView(onboard: number) {
  const obi = Math.max(0, Math.min(2, onboard - 1));
  return { ...ONBOARDING[obi], index: obi, cta: obi === 2 ? 'Start using Pantry Pal' : 'Next' };
}
