// Seed state for ?screen= deep links (screenshots, First Click and Five Second tests). Pure.
import { findRecipe } from './selectors';
import type { AppState } from './types';

export const DEEP_SCREENS = ['home', 'pantry', 'recipes', 'me', 'scan', 'scanresult', 'add', 'recipe', 'cook', 'share'] as const;
export type DeepScreen = (typeof DEEP_SCREENS)[number];

export const isDeepScreen = (v: string | null): v is DeepScreen => !!v && (DEEP_SCREENS as readonly string[]).includes(v);

/**
 * Applies a deep link to a fresh state. The back stack is seeded so Back behaves as if the
 * participant had navigated there. `addOn` is the screen the add sheet opens over (variant dependent).
 */
export function applyDeepLink(st: AppState, screen: DeepScreen, recipeId: string, addOn: 'home' | 'pantry'): AppState {
  const id = findRecipe(st, recipeId) ? recipeId : 'frittata';
  switch (screen) {
    case 'home': return st;
    case 'pantry': return { ...st, screen: 'pantry' };
    case 'recipes': return { ...st, screen: 'recipes' };
    case 'me': return { ...st, screen: 'profile' };
    case 'scan': return { ...st, screen: 'scan', stack: [{ screen: 'home' }] };
    case 'scanresult': return { ...st, screen: 'scanResult', stack: [{ screen: 'home' }] };
    case 'add': return { ...st, screen: addOn, addSheet: true };
    case 'recipe': return { ...st, screen: 'recipe', recipeId: id, stack: [{ screen: 'recipes' }] };
    case 'cook': return { ...st, screen: 'cook', recipeId: id, cookStep: 0, stack: [{ screen: 'recipes' }, { screen: 'recipe', recipeId: id }] };
    case 'share': return { ...st, screen: 'recipe', recipeId: id, stack: [{ screen: 'recipes' }], shareFor: id, shareTo: [] };
  }
}
