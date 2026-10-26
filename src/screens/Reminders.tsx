import { Switch } from '../components/Check';
import { ChipGroup, chipsOf } from '../components/Chip';
import { BackButton } from '../components/TopBar';
import { LEAD_PRESETS } from '../state/seed';
import { leadLabel } from '../state/selectors';
import { useStore } from '../store';

export function Reminders() {
  const { state, dispatch } = useStore();
  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">Expiry reminders</p></div>
      <div className="scroll">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}><span style={{ fontWeight: 600 }}>Remind me before food expires</span><span className="small muted">With recipes that use it.</span></span>
          <Switch on={state.reminders} label="Expiry reminders" onToggle={() => dispatch({ type: 'toggleRem' })} />
        </div>
        <div className="field">
          <span className="label">How early?</span>
          <ChipGroup options={chipsOf(LEAD_PRESETS, state.lead, leadLabel)} onPick={(lead) => dispatch({ type: 'setLead', lead })} />
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}><span style={{ fontWeight: 600 }}>Weekly pantry summary</span><span className="small muted">Sunday morning.</span></span>
          <Switch on={state.digest} label="Weekly summary" onToggle={() => dispatch({ type: 'toggleDigest' })} />
        </div>
      </div>
    </div>
  );
}
