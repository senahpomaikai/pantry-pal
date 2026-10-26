import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useFlags } from '../variants';

const W = 390, H = 844, MOBILE_MAX = 480, MARGIN = 24;

interface Layout { framed: boolean; scale: number }

function measure(frame: boolean): Layout {
  const w = window.innerWidth, h = window.innerHeight;
  if (!frame || w <= MOBILE_MAX) return { framed: false, scale: 1 };
  return { framed: true, scale: Math.min(1, (h - MARGIN * 2) / H, (w - MARGIN * 2) / W) };
}

/**
 * Phones (<= 480px wide) get the app full-bleed. Wider screens get a 390x844 phone frame on a warm-gray
 * backdrop, scaled down to fit the window height (fully visible on a 768px-tall laptop). ?frame=0 opts out.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const { frame } = useFlags();
  const [layout, setLayout] = useState(() => measure(frame));
  useEffect(() => {
    const onResize = () => setLayout(measure(frame));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [frame]);
  return (
    <div className={'stage ' + (layout.framed ? 'framed' : 'bleed')}>
      <div className="frame" style={{ '--frame-scale': layout.scale } as CSSProperties}>{children}</div>
    </div>
  );
}
