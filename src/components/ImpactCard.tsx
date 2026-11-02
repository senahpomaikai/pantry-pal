import { useEffect, useState } from 'react';
import { impactText } from '../state/impact';
import type { Impact } from '../state/types';
import { useStore } from '../store';
import { useVariantConfig } from '../variants';
import { Icon } from './Icon';

const COUNT_MS = 700;
const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts from zero to the saved amounts as the card arrives. */
function useCountUp(impact: Impact): Impact {
  const [p, setP] = useState(() => (calm() ? 1 : 0));
  useEffect(() => {
    if (calm()) return;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / COUNT_MS);
      setP(1 - (1 - t) ** 3);
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return { dollars: Math.round(impact.dollars * p * 2) / 2, lbs: Math.round(impact.lbs * p * 10) / 10 };
}

function ImpactBody({ impact }: { impact: Impact }) {
  const { dispatch } = useStore();
  const shown = useCountUp(impact);
  return (
    <div className="modal impact" role="dialog" aria-modal="true" aria-label="Your impact">
      <span className="impact-leaf"><Icon name="logo" /></span>
      <p className="impact-text" aria-hidden="true">{impactText(shown)}</p>
      <span className="sr-only">{impactText(impact)}</span>
      <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'dismissImpact' })}>Done</button>
    </div>
  );
}

/** Version B only: the money and food saved. It stays until dismissed. */
export function ImpactCard() {
  const { state } = useStore();
  const { impactMessage } = useVariantConfig();
  if (!impactMessage || !state.impact) return null;
  return <div className="overlay center" style={{ zIndex: 35 }}><ImpactBody impact={state.impact} /></div>;
}
