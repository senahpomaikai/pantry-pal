import { ChipGroup } from '../components/Chip';
import { BackButton } from '../components/TopBar';
import { DIETS } from '../state/seed';
import { useStore } from '../store';

export function Diet() {
  const { state, dispatch } = useStore();
  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">Food preferences</p></div>
      <div className="scroll">
        <p className="lead">Pick any that apply.</p>
        <ChipGroup options={DIETS.map((n) => ({ value: n, label: n, on: state.diet.indexOf(n) >= 0 }))} onPick={(diet) => dispatch({ type: 'toggleDiet', diet })} />
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'saveDiet' })}>Save preferences</button>
      </div>
    </div>
  );
}
