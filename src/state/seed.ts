// Seed data and initial state, ported verbatim from the prototype's constructor.
import type { AppState, Diet, Draft, DayForm, GoalPreset, LocForm, ManualForm, PantryItem, Recipe, Unit } from './types';

export const RECIPES: Recipe[] = [
  { id: 'frittata', title: 'Spinach & Tomato Frittata', time: 25, serves: 2, by: 'Pantry Pal', diet: ['Vegetarian', 'Gluten-free', 'Nut-free'], ings: ['Eggs', 'Spinach', 'Cherry tomatoes', 'Cheddar', 'Onion'], amts: [[6, 'whole'], [2, 'cup'], [1, 'cup'], [0.5, 'cup'], [1, 'whole']], steps: ['Heat the oven to 375°F. Whisk 6 eggs with a pinch of salt.', 'Soften a chopped onion in an oven-safe pan, then wilt the spinach.', 'Add halved tomatoes, pour in the eggs and top with cheddar.', 'Bake 12 to 15 minutes, until just set.'] },
  { id: 'quesadilla', title: 'Spinach Cheese Quesadillas', time: 15, serves: 2, by: 'Pantry Pal', diet: ['Vegetarian', 'Nut-free'], ings: ['Tortillas', 'Spinach', 'Cheddar', 'Garlic'], amts: [[4, 'whole'], [2, 'cup'], [1, 'cup'], [2, 'clove']], steps: ['Cook garlic and spinach in a pan until wilted.', 'Fill tortillas with the spinach and cheddar, then fold.', 'Crisp in a dry pan, 2 to 3 minutes per side.'] },
  { id: 'chickenrice', title: 'Garlic Chicken & Rice', time: 40, serves: 4, by: 'Pantry Pal', diet: ['Gluten-free', 'Dairy-free', 'Nut-free'], ings: ['Chicken thighs', 'Rice', 'Garlic', 'Onion'], amts: [[1.5, 'lb'], [1, 'cup'], [4, 'clove'], [1, 'whole']], steps: ['Start the rice.', 'Season the chicken and sear skin-side down until crisp.', 'Add sliced onion and garlic, cover and cook through.', 'Serve over rice with the pan juices.'] },
  { id: 'friedrice', title: 'Veggie Fried Rice', time: 20, serves: 2, by: 'Pantry Pal', diet: ['Vegetarian', 'Dairy-free', 'Nut-free'], ings: ['Rice', 'Eggs', 'Onion', 'Garlic', 'Frozen peas'], amts: [[3, 'cup'], [2, 'whole'], [1, 'whole'], [2, 'clove'], [1, 'cup']], steps: ['Scramble the eggs in a hot pan and set aside.', 'Fry onion, garlic and peas.', 'Add cold rice and stir-fry until hot.', 'Fold the eggs back in and season.'] },
  { id: 'pasta', title: 'Creamy Tomato Pasta', time: 30, serves: 3, by: 'Pantry Pal', diet: ['Vegetarian', 'Nut-free'], ings: ['Pasta', 'Cherry tomatoes', 'Milk', 'Garlic'], amts: [[8, 'oz'], [2, 'cup'], [0.5, 'cup'], [3, 'clove']], steps: ['Boil the pasta.', 'Cook tomatoes with garlic until they burst.', 'Stir in milk and simmer to thicken.', 'Toss with the pasta and a splash of pasta water.'] },
  { id: 'smoothie', title: 'Green Smoothie', time: 5, serves: 1, by: 'Pantry Pal', diet: ['Vegetarian', 'Gluten-free', 'Nut-free'], ings: ['Spinach', 'Milk', 'Banana'], amts: [[1, 'cup'], [1, 'cup'], [1, 'whole']], steps: ['Add spinach, milk and banana to a blender.', 'Blend until smooth.'] },
  { id: 'orzo', title: 'Lemon Orzo with Greens', time: 25, serves: 2, by: 'Maya', friend: true, diet: ['Vegetarian', 'Vegan', 'Dairy-free', 'Nut-free'], ings: ['Orzo', 'Spinach', 'Lemon', 'Garlic'], amts: [[1, 'cup'], [3, 'cup'], [1, 'whole'], [2, 'clove']], steps: ['Toast orzo in a little oil, then simmer in salted water.', 'Stir in garlic and spinach until wilted.', 'Finish with lemon zest and juice.'] },
  { id: 'tacos', title: 'Sheet-pan Chicken Tacos', time: 35, serves: 4, by: 'Jordan', friend: true, diet: ['Dairy-free', 'Nut-free'], ings: ['Chicken thighs', 'Tortillas', 'Onion', 'Lime'], amts: [[2, 'lb'], [8, 'whole'], [1, 'whole'], [2, 'whole']], steps: ['Toss chicken and onion with spices on a sheet pan.', 'Roast at 425°F for 20 minutes.', 'Slice and serve in warm tortillas with lime.'] },
];

export const FRIENDS = ['Maya', 'Jordan', 'Sam', 'Priya'];
export const LOCS = ['Fridge', 'Freezer', 'Pantry', 'Counter'];

export const GOALS: GoalPreset[] = [
  { key: 'use5', title: 'Use up 5 items', sub: 'Mark items as used' },
  { key: 'cook3', title: 'Cook 3 meals from my pantry', sub: 'Finish recipes in cook mode' },
  { key: 'soon', title: 'Use everything expiring soon', sub: 'Items with 3 days or fewer' },
];

export const DIETS: Diet[] = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free'];
export const UNITS: Unit[] = ['whole', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'clove', 'pinch'];
export const QUICK_PICKS = ['Spinach', 'Bananas', 'Yogurt', 'Bread'];
export const SCAN_DAY_PRESETS = [3, 5, 7];
export const MANUAL_DAY_PRESETS = [2, 5, 7, 14, 30];
export const TIME_PRESETS = [15, 30, 45, 60];
export const LEAD_PRESETS = [1, 2, 3];

export const PANTRY_SEED: PantryItem[] = [
  { id: 1, name: 'Chicken thighs', loc: 'Fridge', qty: '1 lb', days: 1 },
  { id: 2, name: 'Cherry tomatoes', loc: 'Counter', qty: '1 pint', days: 2 },
  { id: 3, name: 'Milk', loc: 'Fridge', qty: 'Half gallon', days: 3 },
  { id: 4, name: 'Tortillas', loc: 'Pantry', qty: '8', days: 5 },
  { id: 5, name: 'Eggs', loc: 'Fridge', qty: '6', days: 12 },
  { id: 6, name: 'Cheddar', loc: 'Fridge', qty: '1 block', days: 14 },
  { id: 7, name: 'Onion', loc: 'Pantry', qty: '3', days: 18 },
  { id: 8, name: 'Garlic', loc: 'Pantry', qty: '1 head', days: 21 },
  { id: 9, name: 'Frozen peas', loc: 'Freezer', qty: '1 bag', days: 120 },
  { id: 10, name: 'Rice', loc: 'Pantry', qty: '2 lb', days: 200 },
];

export const ONBOARDING = [
  { art: 'illustration: groceries into phone', title: 'Log what is in your kitchen', text: 'Scan a barcode or type an item.' },
  { art: 'illustration: fridge with alert', title: 'See what is about to go bad', text: 'Items that expire soon float to the top.' },
  { art: 'illustration: pan + share arrow', title: 'Cook it, save it, share it', text: 'Recipes that use what you have.' },
];

export const blankDraft = (): Draft => ({ title: '', time: 30, serves: 2, ings: [], amts: {}, other: '', steps: [], stepText: '' });
export const blankLocForm = (): LocForm => ({ open: false, name: '', err: '' });
export const blankDayForm = (): DayForm => ({ open: false, num: '', unit: 'days', err: '' });
export const blankForms = () => ({ locForm: blankLocForm(), dayForm: blankDayForm() });
export const blankManual = (): ManualForm => ({ name: '', qty: '', loc: 'Fridge', days: 5 });

export function createInitialState(): AppState {
  return {
    screen: 'home', stack: [], showNotice: true, onboard: 0, showTask: false, taskDone: false, taskDoneShown: false,
    addSheet: false, shareFor: null, shareTo: [], toast: { text: '', n: 0 },
    pantry: PANTRY_SEED.map((p) => ({ ...p })),
    nextId: 20, saved: [], shared: [], mine: [], used: 0, tossed: 0, cooked: 0, usedIds: [], goals: [],
    itemId: null, recipeId: null, cookStep: 0, useUp: [],
    f: blankManual(), scanLoc: 'Fridge', scanDays: 5, customLocs: [],
    q: '', filters: [], filtersOpen: false, seg: 'discover', loc: 'All', exp: 'any', pFiltersOpen: false,
    d: blankDraft(), cStep: 1,
    reminders: true, lead: 2, digest: false, diet: [],
    ...blankForms(),
  };
}
