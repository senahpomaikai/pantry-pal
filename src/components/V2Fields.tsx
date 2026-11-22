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
      <input id={id} className="input" placeholder="Or type a size, e.g. 24 oz" value={value} onChange={(e) => onChange(e.target.value)} />
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
        <Check on={state.rememberDays} />Remember this for {(food?.name ?? name).toLowerCase()} in the {loc.toLowerCase()}
      </button>
    );
  }
  if (saved) return <span className="small autofill"><Icon name="check" size="xs" />Your saved time for {(food?.name ?? name).toLowerCase()} in the {loc.toLowerCase()}</span>;
  if (food) return <span className="small autofill"><Icon name="info" size="xs" />Filled in from food-safety guides for the {loc.toLowerCase()}. No need to check the package.</span>;
  return null;
}
