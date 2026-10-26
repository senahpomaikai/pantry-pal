import { BackButton } from '../components/TopBar';
import { cookView, findRecipe } from '../state/selectors';
import { useStore } from '../store';

export function CookMode() {
  const { state, dispatch } = useStore();
  const cook = cookView(state);
  return (
    <div className="screen">
      <div className="topbar"><BackButton label="Exit cooking" icon="close" /><p className="title">{findRecipe(state, state.recipeId)?.title}</p></div>
      <div className="scroll" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span className="muted" style={{ fontWeight: 600 }}>Step {cook.n} of {cook.total}</span>
          <div className="bar"><span style={{ width: cook.pct }} /></div>
          <p style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.35, margin: '12px 0 0', textWrap: 'pretty' }} aria-live="polite">{cook.text}</p>
        </div>
        <div className="btn-row">
          <button className="btn" disabled={cook.first} onClick={() => dispatch({ type: 'cookPrev' })}>Back</button>
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'cookNext' })}>{cook.nextLabel}</button>
        </div>
      </div>
    </div>
  );
}
