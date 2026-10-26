import { Icon } from '../components/Icon';
import { BackButton } from '../components/TopBar';
import { goalPresets, goalView } from '../state/selectors';
import { useStore } from '../store';

export function Goals() {
  const { state, dispatch } = useStore();
  const cards = state.goals.map((g) => goalView(state, g));
  const presets = goalPresets(state);
  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">My goals</p></div>
      <div className="scroll">
        {cards.length > 0 && (
          <div className="section">
            {cards.map((g) => (
              <div key={g.key} className="card gcard" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}><span className="h3">{g.title}</span><span className="small muted">{g.sub}</span></span>
                  {g.done && <span className="tag done"><Icon name="check" size="xs" />Done</span>}
                </div>
                <div className="bar" role="progressbar" aria-label={g.title} aria-valuemin={0} aria-valuemax={g.target} aria-valuenow={g.have}><span style={{ width: g.pct }} /></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span className="small" style={{ fontWeight: 600 }}>{g.progText}</span>
                  <button className="link" aria-label={'Remove goal: ' + g.title} onClick={() => dispatch({ type: 'removeGoal', key: g.key })}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {presets.length > 0 && (
          <div className="section">
            <h2 className="h2">Add a goal</h2>
            <div className="group">
              {presets.map((p) => (
                <button key={p.key} className="lrow" style={{ minHeight: 64 }} onClick={() => dispatch({ type: 'addGoal', key: p.key })}>
                  <Icon name="plus" size="sm" />
                  <span className="grow" style={{ display: 'flex', flexDirection: 'column' }}><span>{p.title}</span><span className="small muted" style={{ fontWeight: 400 }}>{p.sub}</span></span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
