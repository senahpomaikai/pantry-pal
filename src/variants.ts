// Query-parameter flags, read once on load. See README "Query parameters".
import { createContext, useContext } from 'react';
import { isDeepScreen, type DeepScreen } from './state/deeplink';

export type Variant = 'a' | 'b';

export interface Flags {
  /** A/B version. A = control, B = impact message. */
  variant: Variant;
  /** Show the household setup screen on load. */
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
 * Everything that differs between the versions lives here. A is the control; B adds the impact message.
 */
export interface VariantConfig {
  /** After food is used, show the money and food saved. */
  impactMessage: boolean;
}

export const VARIANT_CONFIG: Record<Variant, VariantConfig> = {
  a: { impactMessage: false },
  b: { impactMessage: true },
};

export const FlagsContext = createContext<Flags>(parseFlags(''));

export const useFlags = () => useContext(FlagsContext);
export const useVariant = () => useContext(FlagsContext).variant;
export const useVariantConfig = () => VARIANT_CONFIG[useVariant()];
