import { ChipGroup, chipsOf } from '../components/Chip';
import { CustomPlace, CustomTime } from '../components/CustomForms';
import { BackButton } from '../components/TopBar';
import { MANUAL_DAY_PRESETS, QUICK_PICKS } from '../state/seed';
import { dayFmt, dayOpts, locations } from '../state/selectors';
import { useStore } from '../store';

export function AddItem() {
  const { state, dispatch } = useStore();
  const f = state.f;
  const empty = !f.name.trim();
  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">Add an item</p></div>
      <div className="scroll">
        <div className="field">
          <label className="label" htmlFor="f-name">What is it?</label>
          <input id="f-name" className="input" placeholder="e.g. Spinach" value={f.name} onChange={(e) => dispatch({ type: 'setF', patch: { name: e.target.value } })} />
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0 14px' }}>
            <span className="small muted">Try</span>
            {QUICK_PICKS.map((n) => <button key={n} className="action" onClick={() => dispatch({ type: 'setF', patch: { name: n } })}>{n}</button>)}
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="f-qty">How much? (optional)</label>
          <input id="f-qty" className="input" placeholder="e.g. 1 bag" value={f.qty} onChange={(e) => dispatch({ type: 'setF', patch: { qty: e.target.value } })} />
        </div>
        <div className="field">
          <span className="label" id="f-where">Where?</span>
          <ChipGroup labelledBy="f-where" options={chipsOf(locations(state), f.loc)} onPick={(loc) => dispatch({ type: 'setF', patch: { loc } })} />
          <CustomPlace />
        </div>
        <div className="field">
          <span className="label" id="f-days">Good for about</span>
          <ChipGroup labelledBy="f-days" options={chipsOf(dayOpts(MANUAL_DAY_PRESETS, f.days), f.days, dayFmt)} onPick={(days) => dispatch({ type: 'setF', patch: { days } })} />
          <CustomTime />
        </div>
        <button className="btn btn-primary btn-block" disabled={empty} onClick={() => dispatch({ type: 'addManual' })}>Add to my pantry</button>
        {empty && <span className="why">Add a name to continue</span>}
      </div>
    </div>
  );
}
