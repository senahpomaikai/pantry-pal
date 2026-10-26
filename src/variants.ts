// Query-parameter flags, read once on load. See README "Query parameters".
import { createContext, useContext } from 'react';
import { isDeepScreen, type DeepScreen } from './state/deeplink';

export type Variant = 'a' | 'b';

export interface Flags {
  /** A/B variant. A = the prototype exactly as designed. */
  variant: Variant;
  /** Show the test-task layer: top strip, welcome notice, tour, task sheet, completion modal. */
  task: boolean;
  /** Show the welcome notice and tour on load. */
  intro: boolean;
  /** Desktop phone frame. */
  frame: boolean;
  screen: DeepScreen | null;
  id: string;
}

const VARIANT_KEY = 'pantry-pal:variant';

interface KeyValueStore { getItem(k: string): string | null; setItem(k: string, v: string): void }

/** Parses flags from a query string. The variant is remembered for the session so a refresh keeps it. */
export function parseFlags(search: string, session?: KeyValueStore): Flags {
  const p = new URLSearchParams(search);
  const fromUrl = p.get('v')?.toLowerCase();
  let variant: Variant = 'a';
  if (fromUrl === 'a' || fromUrl === 'b') {
    variant = fromUrl;
    try { session?.setItem(VARIANT_KEY, variant); } catch { /* storage blocked: URL still wins */ }
  } else {
    try {
      const saved = session?.getItem(VARIANT_KEY);
      if (saved === 'a' || saved === 'b') variant = saved;
    } catch { /* storage blocked: default to A */ }
  }
  const screen = p.get('screen')?.toLowerCase() ?? null;
  return {
    variant,
    task: p.get('task') !== '0',
    intro: p.get('intro') !== '0',
    frame: p.get('frame') !== '0',
    screen: isDeepScreen(screen) ? screen : null,
    id: p.get('id') || 'frittata',
  };
}

export function readFlags(): Flags {
  let session: KeyValueStore | undefined;
  try { session = window.sessionStorage; } catch { session = undefined; }
  return parseFlags(window.location.search, session);
}

/**
 * Everything that differs between variants lives here. To change variant B, edit its row
 * (see README, "Changing version B").
 */
export interface VariantConfig {
  /** Centre "+" tab in the tab bar that opens the Add sheet. */
  addTab: boolean;
  /** "Add" button in the My pantry header that opens the Add sheet. */
  pantryAddButton: boolean;
  /** Show the "Recipes › Write a recipe" group in the Add sheet. */
  addSheetRecipes: boolean;
  /** Screen the add sheet opens over for ?screen=add (where the variant's add entry point lives). */
  addSheetOver: 'home' | 'pantry';
}

export const VARIANT_CONFIG: Record<Variant, VariantConfig> = {
  a: { addTab: true, pantryAddButton: false, addSheetRecipes: true, addSheetOver: 'home' },
  b: { addTab: false, pantryAddButton: true, addSheetRecipes: false, addSheetOver: 'pantry' },
};

export const FlagsContext = createContext<Flags>(parseFlags(''));

export const useFlags = () => useContext(FlagsContext);
export const useVariant = () => useContext(FlagsContext).variant;
export const useVariantConfig = () => VARIANT_CONFIG[useVariant()];
