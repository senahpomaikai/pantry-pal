// Domain + app state types. Pure TypeScript: no DOM or React imports, so a React Native port can reuse this layer.

export type ScreenName =
  | 'home' | 'pantry' | 'item' | 'scan' | 'scanResult' | 'manual'
  | 'recipes' | 'recipe' | 'cook' | 'useup' | 'create'
  | 'shared' | 'notifs' | 'profile' | 'goals' | 'reminders' | 'diet' | 'help';

export type TabName = 'home' | 'pantry' | 'recipes' | 'profile';

export type Unit = 'whole' | 'tsp' | 'tbsp' | 'cup' | 'oz' | 'lb' | 'clove' | 'pinch';

export type Diet = 'Vegetarian' | 'Vegan' | 'Gluten-free' | 'Dairy-free' | 'Nut-free';

export interface Recipe {
  id: string;
  title: string;
  time: number;
  serves: number;
  by: string;
  friend?: boolean;
  diet: Diet[];
  ings: string[];
  amts: [number, Unit][];
  steps: string[];
}

export interface PantryItem {
  id: number;
  name: string;
  loc: string;
  qty: string;
  days: number;
}

export type GoalKey = 'use5' | 'cook3' | 'soon';

export interface GoalPreset {
  key: GoalKey;
  title: string;
  sub: string;
}

/** An active goal. `base` is the counter value when the goal was added; `snap`/`names` freeze the expiring items. */
export type Goal =
  | { key: 'use5' | 'cook3'; base: number }
  | { key: 'soon'; snap: number[]; names: string[] };

export interface StackEntry {
  screen: ScreenName;
  itemId?: number | null;
  recipeId?: string | null;
  cStep?: number;
}

export interface Amount {
  q: string;
  u: Unit;
}

export interface Draft {
  title: string;
  time: number;
  serves: number;
  ings: string[];
  amts: Record<string, Amount>;
  other: string;
  steps: string[];
  stepText: string;
}

export interface ManualForm {
  name: string;
  qty: string;
  loc: string;
  days: number;
}

export interface LocForm {
  open: boolean;
  name: string;
  err: string;
}

export type DayUnit = 'days' | 'weeks' | 'months';

export interface DayForm {
  open: boolean;
  num: string;
  unit: DayUnit;
  err: string;
}

export type ExpFilter = 'any' | 'soon' | 'week' | 'later';
export type RecipeFilter = 'soon' | 'quick' | 'ready' | 'diet';
export type Seg = 'discover' | 'saved' | 'mine';
export type UseKind = 'used' | 'tossed';

export interface Toast {
  text: string;
  /** Bumped on every message so the auto-dismiss timer restarts, like clearTimeout in the prototype. */
  n: number;
}

export interface AppState {
  screen: ScreenName;
  stack: StackEntry[];
  showNotice: boolean;
  onboard: number;
  showTask: boolean;
  taskDone: boolean;
  taskDoneShown: boolean;
  addSheet: boolean;
  shareFor: string | null;
  shareTo: string[];
  toast: Toast;
  pantry: PantryItem[];
  nextId: number;
  saved: string[];
  shared: string[];
  mine: Recipe[];
  used: number;
  tossed: number;
  cooked: number;
  usedIds: number[];
  goals: Goal[];
  itemId: number | null;
  recipeId: string | null;
  cookStep: number;
  useUp: number[];
  f: ManualForm;
  scanLoc: string;
  scanDays: number;
  customLocs: string[];
  q: string;
  filters: RecipeFilter[];
  filtersOpen: boolean;
  seg: Seg;
  loc: string;
  exp: ExpFilter;
  pFiltersOpen: boolean;
  d: Draft;
  cStep: number;
  reminders: boolean;
  lead: number;
  digest: boolean;
  diet: Diet[];
  locForm: LocForm;
  dayForm: DayForm;
}
