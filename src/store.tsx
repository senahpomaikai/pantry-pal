// React binding for src/state: one useReducer + context. src/state itself stays free of React and the DOM.
import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { applyDeepLink } from './state/deeplink';
import { reducer, type Action } from './state/reducer';
import { createInitialState } from './state/seed';
import { nextTask, taskUrl } from './state/task';
import type { AppState } from './state/types';
import type { Flags } from './variants';

interface Store { state: AppState; dispatch: Dispatch<Action> }

const StoreContext = createContext<Store | null>(null);

export function initState(flags: Flags): AppState {
  let st = createInitialState();
  if (!flags.intro) st = { ...st, showWelcome: false };
  if (flags.screen) st = applyDeepLink(st, flags.screen, flags.id);
  return { ...st, task: st.showWelcome ? '' : '1' };
}

/** The app's reducer, plus the test task it has reached. */
function tracked(st: AppState, a: Action): AppState {
  const next = reducer(st, a);
  const task = nextTask(st, a, next);
  return task === next.task ? next : { ...next, task };
}

/**
 * UXtweak reads ?task= to follow the tester. replaceState changes the address without a reload, a new Back entry or a render.
 * If UXtweak's recorder misses it, change this to 'pushState'.
 */
const HISTORY_METHOD: 'replaceState' | 'pushState' = 'replaceState';

const TOAST_MS = 2600;

export function StoreProvider({ flags, children }: { flags: Flags; children: ReactNode }) {
  const [state, dispatch] = useReducer(tracked, flags, initState);

  // Each new toast restarts the 2.6s timer (the prototype's clearTimeout + setTimeout).
  const { n, text } = state.toast;
  useEffect(() => {
    if (!text) return;
    const t = setTimeout(() => dispatch({ type: 'clearToast', n }), TOAST_MS);
    return () => clearTimeout(t);
  }, [n, text]);

  useEffect(() => {
    const url = taskUrl(window.location.href, state.task);
    const here = window.location.pathname + window.location.search + window.location.hash;
    if (url !== here) window.history[HISTORY_METHOD](window.history.state, '', url);
  }, [state.task]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside <StoreProvider>');
  return s;
}
