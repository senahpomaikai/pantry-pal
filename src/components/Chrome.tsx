// The intro tour, replayed from Me or About.
import { onboardView } from '../state/selectors';
import { ONBOARDING } from '../state/seed';
import { useStore } from '../store';

export function Onboarding() {
  const { state, dispatch } = useStore();
  if (state.onboard === 0) return null;
  const ob = onboardView(state.onboard);
  return (
    <div className="overlay onboard" style={{ background: '#FFFFFF', alignItems: 'stretch', flexDirection: 'column', zIndex: 25 }} role="dialog" aria-modal="true" aria-labelledby="ob-title">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 10px' }}>
        <button className="btn btn-ghost" style={{ minHeight: 44 }} onClick={() => dispatch({ type: 'skipOnboard' })}>Skip</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, padding: '8px 28px 28px', justifyContent: 'center' }}>
        <div className="ph" style={{ height: 240 }}>{ob.art}</div>
        <h1 className="h1" id="ob-title">{ob.title}</h1>
        <p className="lead">{ob.text}</p>
      </div>
      <div style={{ padding: '0 24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="dots">{ONBOARDING.map((_, i) => <span key={i} className={i === ob.index ? 'on' : ''} />)}</div>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'nextOnboard' })}>{ob.cta}</button>
      </div>
    </div>
  );
}
