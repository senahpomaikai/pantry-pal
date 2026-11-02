/// <reference types="vite/client" />
// Which version this build is, and query-parameter flags read once on load. See README "Query parameters".
import { createContext, useContext } from 'react';
import { isDeepScreen, type DeepScreen } from './state/deeplink';

export type Variant = 'a' | 'b';

/** A = control, B = impact message. Locked in at build time: each version is its own build (see scripts/build.mjs). */
export const VARIANT: Variant = import.meta.env.VITE_VARIANT === 'b' ? 'b' : 'a';

export interface Flags {
  /** Show the welcome screen on load. */
  intro: boolean;
  /** Desktop phone frame. */
  frame: boolean;
  screen: DeepScreen | null;
  id: string;
}

/** Parses flags from a query string. */
export function parseFlags(search: string): Flags {
  const p = new URLSearchParams(search);
  const screen = p.get('screen')?.toLowerCase() ?? null;
  return {
    intro: p.get('intro') !== '0',
    frame: p.get('frame') !== '0',
    screen: isDeepScreen(screen) ? screen : null,
    id: p.get('id') || 'frittata',
  };
}

export const readFlags = () => parseFlags(window.location.search);

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
export const useVariantConfig = () => VARIANT_CONFIG[VARIANT];
