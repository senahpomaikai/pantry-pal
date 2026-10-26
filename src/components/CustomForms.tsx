import { useStore } from '../store';
import type { DayUnit } from '../state/types';
import { ChipGroup } from './Chip';
import { Icon } from './Icon';

export function ErrLine({ id, children }: { id?: string; children: string }) {
  return <span className="err" id={id} role="alert"><Icon name="alert" size="sm" />{children}</span>;
}

/** "Custom place" action + mini form (shared by Scan result and Add an item). */
export function CustomPlace() {
  const { state, dispatch } = useStore();
  const f = state.locForm;
  return (
    <>
      <button className="action" style={{ alignSelf: 'flex-start' }} aria-expanded={f.open} onClick={() => dispatch({ type: 'toggleLocForm' })}>
        <Icon name="plus" size="sm" />Custom place
      </button>
      {f.open && (
        <div className="miniform">
          <label className="label" htmlFor="cl-name">Name the place</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input id="cl-name" className="input" maxLength={20} placeholder="e.g. Garage fridge" value={f.name}
              onChange={(e) => dispatch({ type: 'clName', value: e.target.value })}
              aria-invalid={!!f.err} aria-describedby="cl-help cl-err" />
            <button className="btn btn-primary" style={{ flex: 'none' }} onClick={() => dispatch({ type: 'clAdd' })}>Add</button>
          </div>
          <span className="small muted" id="cl-help">{f.name.length}/20</span>
          {f.err && <ErrLine id="cl-err">{f.err}</ErrLine>}
          <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => dispatch({ type: 'clCancel' })}>Cancel</button>
        </div>
      )}
    </>
  );
}

const UNITS: [DayUnit, string][] = [['days', 'Days'], ['weeks', 'Weeks'], ['months', 'Months']];

/** "Custom time" action + mini form (shared by Scan result and Add an item). */
export function CustomTime() {
  const { state, dispatch } = useStore();
  const f = state.dayForm;
  return (
    <>
      <button className="action" style={{ alignSelf: 'flex-start' }} aria-expanded={f.open} onClick={() => dispatch({ type: 'toggleDayForm' })}>
        <Icon name="plus" size="sm" />Custom time
      </button>
      {f.open && (
        <div className="miniform">
          <label className="label" htmlFor="cd-num">How long?</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input id="cd-num" className="input" type="number" inputMode="numeric" min={1} step={1} placeholder="e.g. 10" value={f.num}
              onChange={(e) => dispatch({ type: 'cdNum', value: e.target.value })}
              aria-invalid={!!f.err} aria-describedby="cd-err" />
            <button className="btn btn-primary" style={{ flex: 'none' }} onClick={() => dispatch({ type: 'cdSet' })}>Set</button>
          </div>
          <ChipGroup label="Unit" options={UNITS.map(([v, l]) => ({ value: v, label: l, on: f.unit === v }))}
            onPick={(unit) => dispatch({ type: 'cdUnit', unit })} />
          {f.err && <ErrLine id="cd-err">{f.err}</ErrLine>}
          <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => dispatch({ type: 'cdCancel' })}>Cancel</button>
        </div>
      )}
    </>
  );
}
