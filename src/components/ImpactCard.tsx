import { impactText } from '../state/impact';
import { useStore } from '../store';
import { useVariantConfig } from '../variants';

/** Version B only: the money and food saved. It stays until dismissed. */
export function ImpactCard() {
  const { state, dispatch } = useStore();
  const { impactMessage } = useVariantConfig();
  if (!impactMessage || !state.impact) return null;
  return (
    <div className="overlay center" style={{ zIndex: 35 }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Your impact">
        <p className="lead" style={{ margin: 0 }}>{impactText(state.impact)}</p>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'dismissImpact' })}>Done</button>
      </div>
    </div>
  );
}
