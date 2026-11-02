import { BackButton } from '../components/TopBar';
import { useStore } from '../store';

export function About() {
  const { dispatch } = useStore();
  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">About this prototype</p></div>
      <div className="scroll" style={{ gap: 14 }}>
        <p className="lead">An early, low-fidelity version of Pantry Pal. Plain boxes stand in for photos. Colors, words and layouts will change.</p>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ fontWeight: 600 }}>What works</span><span className="muted">Pantry items, recipes and filters, saving, writing recipes, cooking step by step, sharing, and goals.</span></div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ fontWeight: 600 }}>What is pretend</span><span className="muted">The scanner, photos, friends and sending. Nothing is saved after you close the page.</span></div>
        <button className="btn btn-ghost btn-block" onClick={() => dispatch({ type: 'replayIntro' })}>Replay the intro</button>
      </div>
    </div>
  );
}
