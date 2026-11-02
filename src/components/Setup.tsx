import { DIETS, HOUSEHOLD_SIZES } from '../state/seed';
import { useStore } from '../store';
import { ChipGroup } from './Chip';

/** First-run household setup. Choices last for this session, like everything else in the prototype. */
export function Setup() {
  const { state, dispatch } = useStore();
  if (!state.showSetup) return null;
  return (
    <div className="overlay onboard" style={{ background: '#FFFFFF', alignItems: 'stretch', flexDirection: 'column', zIndex: 25 }} role="dialog" aria-modal="true" aria-labelledby="setup-title">
      <div className="scroll" style={{ flex: 1, padding: '28px 24px', gap: 22 }}>
        <h1 className="h1" id="setup-title">Set up your household</h1>
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
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'finishSetup' })}>Continue</button>
      </div>
    </div>
  );
}
