// React binding for src/state: one useReducer + context. src/state itself stays free of React and the DOM.
import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { applyDeepLink } from './state/deeplink';
import { reducer, type Action } from './state/reducer';
import { createInitialState } from './state/seed';
import type { AppState } from './state/types';
import type { Flags } from './variants';

interface Store { state: AppState; dispatch: Dispatch<Action> }

const StoreContext = createContext<Store | null>(null);

export function initState(flags: Flags): AppState {
  let st = createInitialState();
  if (!flags.intro) st = { ...st, showWelcome: false };
  if (flags.screen) st = applyDeepLink(st, flags.screen, flags.id);
  return st;
}

const TOAST_MS = 2600;

export function StoreProvider({ flags, children }: { flags: Flags; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, flags, initState);

  // Each new toast restarts the 2.6s timer (the prototype's clearTimeout + setTimeout).
  const { n, text } = state.toast;
  useEffect(() => {
    if (!text) return;
    const t = setTimeout(() => dispatch({ type: 'clearToast', n }), TOAST_MS);
    return () => clearTimeout(t);
  }, [n, text]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside <StoreProvider>');
  return s;
}
