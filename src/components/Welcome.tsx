import { useState, type CSSProperties } from 'react';
import { useStore } from '../store';
import { Icon } from './Icon';

const PHOTOS = Object.values(import.meta.glob('../assets/food/*.jpg', { eager: true, query: '?url', import: 'default' })) as string[];

const HEIGHTS = [168, 232, 136, 204, 180];
/** How far each column sits from the viewer, so the wall has depth as well as drift. */
const DEPTHS = [-140, 40, -60, 90, -180, 10, -100, 60];
const SOLIDS = ['cream', 'sage'];

let next = 0;
const columns = DEPTHS.map((z, c) => ({
  z,
  tiles: HEIGHTS.map((_, t) => {
    const i = c * HEIGHTS.length + t;
    const height = HEIGHTS[(t + c) % HEIGHTS.length];
    if (i % 8 === 5) return { photo: null, solid: SOLIDS[c % SOLIDS.length], height };
    // Stepping through the photos keeps similar foods apart.
    return { photo: PHOTOS[(next++ * 7) % PHOTOS.length], solid: '', height };
  }),
}));

function Wall({ copy }: { copy: number }) {
  return (
    <>
      {columns.map((col, c) => (
        <div key={copy + '-' + c} className="wall-col" style={{ '--z': col.z + 'px', '--i': c, marginTop: (c % 3) * -36 } as CSSProperties}>
          {col.tiles.map((t, i) => (
            <div key={i} className={'wall-tile ' + t.solid} style={{ height: t.height }}>{t.photo && <img src={t.photo} alt="" />}</div>
          ))}
        </div>
      ))}
    </>
  );
}

const LEAVE_MS = 240;

/** The first screen in both versions: a wall of food behind the way into the app. */
export function Welcome() {
  const { state, dispatch } = useStore();
  const [leaving, setLeaving] = useState(false);
  if (!state.showWelcome) return null;
  const enter = () => {
    setLeaving(true);
    setTimeout(() => dispatch({ type: 'enterApp' }), LEAVE_MS);
  };
  return (
    <main className={'welcome' + (leaving ? ' leaving' : '')}>
      <div className="wall" aria-hidden="true">
        <div className="wall-drift"><Wall copy={0} /><Wall copy={1} /></div>
      </div>
      <div className="welcome-front">
        <div className="welcome-mark"><Icon name="logo" /><h1>Pantry Pal</h1></div>
        <p>Cook what you already have.</p>
        <button className="btn btn-block welcome-go" disabled={leaving} onClick={enter}>Go to my pantry</button>
      </div>
    </main>
  );
}
