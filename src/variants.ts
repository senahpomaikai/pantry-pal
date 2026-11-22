/// <reference types="vite/client" />
// Which version this build is, and query-parameter flags read once on load. See README "Query parameters".
import { createContext, useContext } from 'react';
import { isDeepScreen, type DeepScreen } from './state/deeplink';

export type Variant = 'a' | 'b' | 'v2';

/** A = control, B = impact message, v2 = revised after user testing. Locked in at build time: each version is its own build (see scripts/build.mjs). */
const RAW = import.meta.env.VITE_VARIANT;
export const VARIANT: Variant = RAW === 'b' ? 'b' : RAW === 'v2' ? 'v2' : 'a';

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
  /** The revisions made after the A/B user tests (Survey Analytics Part 2). A and B stay exactly as tested. */
  revised: boolean;
}

export const VARIANT_CONFIG: Record<Variant, VariantConfig> = {
  a: { impactMessage: false, revised: false },
  b: { impactMessage: true, revised: false },
  v2: { impactMessage: true, revised: true },
};

/** True in the revised build (v2). */
export const REVISED = VARIANT_CONFIG[VARIANT].revised;

export const FlagsContext = createContext<Flags>(parseFlags(''));

export const useFlags = () => useContext(FlagsContext);
export const useVariantConfig = () => VARIANT_CONFIG[VARIANT];
