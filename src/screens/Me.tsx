import { Icon } from '../components/Icon';
import type { Action } from '../state/reducer';
import { useStore } from '../store';

export function Me() {
  const { state, dispatch } = useStore();
  const row = (label: string, action: Action, tag?: string) => (
    <button className="lrow" onClick={() => dispatch(action)}>
      <span className="grow">{label}</span>{tag !== undefined && <span className="tag">{tag}</span>}<Icon name="chevron" size="sm" />
    </button>
  );
  return (
    <div className="screen">
      <div className="topbar"><p className="title">Me</p></div>
      <div className="scroll" style={{ gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="ph" style={{ width: 56, height: 56, borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}><span className="h2">Your name</span><span className="muted small">Home cook</span></div>
        </div>
        <div className="stats">
          <div className="stat used"><span className="dot"><Icon name="check" size="sm" /></span><b>{state.used}</b><span className="small muted">used up</span></div>
          <div className="stat cooked"><span className="dot"><Icon name="pot" size="sm" /></span><b>{state.cooked}</b><span className="small muted">cooked</span></div>
          <div className="stat saved"><span className="dot"><Icon name="bookmark" size="sm" /></span><b>{state.saved.length}</b><span className="small muted">saved</span></div>
        </div>
        <div className="group">
          {row('My goals', { type: 'go', screen: 'goals' }, state.goals.length ? state.goals.length + ' active' : 'None yet')}
          {row('Shared with me', { type: 'go', screen: 'shared' })}
          {row('My recipes', { type: 'tab', tab: 'recipes', seg: 'mine' })}
          {row('Expiry reminders', { type: 'go', screen: 'reminders' })}
          {row('Food preferences', { type: 'go', screen: 'diet' })}
          {row('Replay the intro', { type: 'replayIntro' })}
          {row('About this prototype', { type: 'go', screen: 'help' })}
        </div>
        <span className="note" style={{ textAlign: 'center' }}>counts are from this session only</span>
      </div>
    </div>
  );
}
