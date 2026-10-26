import { Icon } from '../components/Icon';
import { BackButton } from '../components/TopBar';
import { notifRows } from '../state/selectors';
import { useStore } from '../store';

export function Notifications() {
  const { state, dispatch } = useStore();
  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">Notifications</p></div>
      <div className="scroll" style={{ gap: 12 }}>
        <div className="group">
          {notifRows(state.pantry).map((n) => (
            <button key={n.title} className="lrow" style={{ minHeight: 64, fontWeight: 400 }}
              onClick={() => dispatch('itemId' in n.target ? { type: 'go', screen: 'item', itemId: n.target.itemId } : { type: 'go', screen: 'recipe', recipeId: n.target.recipeId })}>
              {n.isWarn
                ? <span className="nicon warn"><Icon name="clockWarn" size="sm" /></span>
                : <span className="nicon"><Icon name="share" size="sm" /></span>}
              <span className="grow" style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>{n.title}</span>
                {n.sub && <span className="small muted">{n.sub}</span>}
              </span>
              <Icon name="chevron" size="sm" />
            </button>
          ))}
        </div>
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'go', screen: 'reminders' })}>Reminder settings</button>
      </div>
    </div>
  );
}
