// React binding for src/state: one useReducer + context. src/state itself stays free of React and the DOM.
import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { applyDeepLink } from './state/deeplink';
import { reducer, type Action } from './state/reducer';
import { createInitialState } from './state/seed';
import { task } from './state/selectors';
import type { AppState } from './state/types';
import { VARIANT_CONFIG, type Flags } from './variants';

interface Store { state: AppState; dispatch: Dispatch<Action> }

const StoreContext = createContext<Store | null>(null);

export function initState(flags: Flags): AppState {
  let st = createInitialState();
  if (!flags.task || !flags.intro) st = { ...st, showNotice: false, onboard: 0 };
  if (flags.screen) st = applyDeepLink(st, flags.screen, flags.id, VARIANT_CONFIG[flags.variant].addSheetOver);
  return st;
}

const TOAST_MS = 2600;

export function StoreProvider({ flags, children }: { flags: Flags; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, flags, initState);

  // Replaces the prototype's componentDidUpdate: open the completion modal once all 3 task steps are done.
  const done = task(state).done;
  useEffect(() => {
    if (done === 3 && !state.taskDoneShown) dispatch({ type: 'taskComplete' });
  }, [done, state.taskDoneShown]);

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
