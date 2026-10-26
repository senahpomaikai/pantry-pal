import { FRIENDS } from '../state/seed';
import { findRecipe, sendLabel } from '../state/selectors';
import { useStore } from '../store';
import { Check } from './Check';
import { Icon } from './Icon';
import { Sheet } from './Sheet';

export function ShareSheet() {
  const { state, dispatch } = useStore();
  const r = findRecipe(state, state.shareFor);
  if (!r) return null;
  const n = state.shareTo.length;
  return (
    <Sheet title={'Share “' + r.title + '”'} label="Share recipe" onClose={() => dispatch({ type: 'closeShare' })}>
      <div className="group">
        {FRIENDS.map((name) => {
          const on = state.shareTo.indexOf(name) >= 0;
          return (
            <button key={name} className="lrow" aria-pressed={on} onClick={() => dispatch({ type: 'toggleShareTo', name })}>
              <div className="ph" style={{ width: 36, height: 36, borderRadius: '50%', fontSize: 16 }}>{name[0]}</div>
              <span className="grow">{name}</span><Check on={on} />
            </button>
          );
        })}
      </div>
      <button className="btn btn-primary btn-block" disabled={n === 0} onClick={() => dispatch({ type: 'sendShare' })}>{sendLabel(n)}</button>
      <button className="btn btn-ghost btn-block" onClick={() => dispatch({ type: 'copyLink' })}><Icon name="link" size="sm" />Copy link instead</button>
    </Sheet>
  );
}
