import { DIETS, HOUSEHOLD_SIZES } from '../state/seed';
import { useStore } from '../store';
import { ChipGroup } from './Chip';

/** Prompt shown over Home on the way in. Choices last for this session, like everything else in the prototype. */
export function Setup() {
  const { state, dispatch } = useStore();
  if (!state.showSetup) return null;
  const close = () => dispatch({ type: 'finishSetup' });
  return (
    <div className="overlay center setup" style={{ zIndex: 25 }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="setup-title">
        <h2 className="h2" id="setup-title" style={{ fontSize: 22 }}>Set up your household</h2>
        <div className="field">
          <span className="label" id="setup-size">How many people live in your home?</span>
          <ChipGroup labelledBy="setup-size" options={HOUSEHOLD_SIZES.map((n) => ({ value: n, label: n, on: state.household === n }))}
            onPick={(household) => dispatch({ type: 'setHousehold', household })} />
        </div>
        <div className="field">
          <span className="label" id="setup-diet">Any food preferences?</span>
          <ChipGroup labelledBy="setup-diet" options={DIETS.map((n) => ({ value: n, label: n, on: state.diet.indexOf(n) >= 0 }))}
            onPick={(diet) => dispatch({ type: 'toggleDiet', diet })} />
        </div>
        <button className="btn btn-primary btn-block" onClick={close}>Continue</button>
        <button className="btn btn-ghost btn-block" onClick={close}>Skip for now</button>
      </div>
    </div>
  );
}
