import { Check } from '../components/Check';
import { BackButton } from '../components/TopBar';
import { cookedCandidates, expLabel } from '../state/selectors';
import { useStore } from '../store';

export function UseUp() {
  const { state, dispatch } = useStore();
  const rows = cookedCandidates(state);
  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">Nice cooking!</p></div>
      <div className="scroll">
        <p className="lead">What did you use up?</p>
        <div className="group">
          {rows.map((p) => {
            const on = state.useUp.indexOf(p.id) >= 0;
            return (
              <button key={p.id} className="lrow" aria-pressed={on} onClick={() => dispatch({ type: 'toggleUseUp', id: p.id })}>
                <Check on={on} /><span className="grow">{p.name}</span><span className="small muted">{expLabel(p.days)}</span>
              </button>
            );
          })}
        </div>
        {rows.length === 0 && <p className="muted" style={{ margin: 0 }}>None of these are in your pantry.</p>}
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'confirmUse' })}>Update my pantry</button>
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'tab', tab: 'home' })}>Skip</button>
      </div>
    </div>
  );
}
