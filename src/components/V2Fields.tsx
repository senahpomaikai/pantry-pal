// v2: shared bits of the add-item and scan-result forms.
import { findFood } from '../state/foods';
import type { PantryItem } from '../state/types';
import { dupLine, sizeOptions } from '../state/v2';
import { useStore } from '../store';
import { Check } from './Check';
import { ChipGroup, chipsOf } from './Chip';
import { Icon } from './Icon';

/** "You already have this" warning, so the same food is not bought or logged twice. */
export function DupWarning({ item }: { item?: PantryItem }) {
  if (!item) return null;
  return <span className="dupwarn" role="status"><Icon name="alert" size="sm" />{dupLine(item)}</span>;
}

/** Package size: common sizes for the food as chips, plus a free-text size. */
export function SizeField({ name, value, onChange, id }: { name: string; value: string; onChange: (qty: string) => void; id: string }) {
  const opts = sizeOptions(name, value);
  return (
    <div className="field">
      <label className="label" htmlFor={id}>Package size</label>
      {opts.length > 0 && <ChipGroup label="Common sizes" options={chipsOf(opts, value)} onPick={onChange} />}
      <input id={id} className="input" placeholder="Other size" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/** Where the shelf life came from, and the option to save a hand-picked one. */
export function DaysHint({ name, loc, byHand, saved }: { name: string; loc: string; byHand: boolean; saved: boolean }) {
  const { state, dispatch } = useStore();
  const food = findFood(name);
  if (byHand && name.trim()) {
    return (
      <button className="remember" aria-pressed={state.rememberDays} onClick={() => dispatch({ type: 'toggleRemember' })}>
        <Check on={state.rememberDays} />Remember for next time
      </button>
    );
  }
  if (saved) return <span className="small autofill"><Icon name="check" size="xs" />Your saved time</span>;
  if (food) return <span className="small autofill"><Icon name="info" size="xs" />Auto-filled for {loc.toLowerCase()}</span>;
  return null;
}
