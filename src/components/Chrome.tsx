// The test-task layer from the prototype. Hidden entirely with ?task=0 (see App).
import { onboardView, task, taskRows } from '../state/selectors';
import { ONBOARDING } from '../state/seed';
import { useStore } from '../store';
import { Check } from './Check';
import { Icon } from './Icon';
import { Sheet } from './Sheet';

export function TopStrip() {
  const { state, dispatch } = useStore();
  return (
    <div className="strip">
      <button className="stamp" onClick={() => dispatch({ type: 'go', screen: 'help' })} aria-label="About this low-fidelity prototype">
        lo-fi prototype<Icon name="info" size="sm" />
      </button>
      <button className="taskbtn" onClick={() => dispatch({ type: 'openTask' })} aria-haspopup="dialog">
        <Icon name="task" size="sm" />Test task: {task(state).done} of 3
      </button>
    </div>
  );
}

export function TaskSheet() {
  const { state, dispatch } = useStore();
  if (!state.showTask) return null;
  const close = () => dispatch({ type: 'closeTask' });
  return (
    <Sheet title="Your test task" label="Your test task" onClose={close}>
      <p className="small muted" style={{ margin: '-8px 0 0' }}>For people trying the prototype. Your own goals live in Me › My goals.</p>
      <p className="lead">You just bought spinach. Get it into your pantry, find a recipe that uses it, then save and share that recipe.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {taskRows(task(state)).map((g) => (
          <div key={g.text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Check on={g.done} />
            <span style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontWeight: 600 }}>{g.text}</span><span className="small muted">{g.hint}</span></span>
          </div>
        ))}
      </div>
      <span className="note">There is more than one way to do each step. Explore!</span>
      <button className="btn btn-primary btn-block" onClick={close}>Got it</button>
    </Sheet>
  );
}

export function Onboarding() {
  const { state, dispatch } = useStore();
  if (!(state.onboard > 0 && !state.showNotice)) return null;
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

export function WelcomeNotice() {
  const { state, dispatch } = useStore();
  if (!state.showNotice) return null;
  return (
    <div className="overlay center" style={{ zIndex: 30 }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="notice-title">
        <span className="stamp" style={{ alignSelf: 'flex-start', cursor: 'default' }}>early prototype</span>
        <h2 className="h2" id="notice-title" style={{ fontSize: 22 }}>Welcome! This is a rough draft.</h2>
        <p style={{ margin: 0 }}>An early, <b>low-fidelity</b> version of Pantry Pal, an app for cooking what you already have. Plain boxes stand in for photos, and some features are pretend.</p>
        <div className="hint"><Icon name="task" /><span><b>Your test task:</b> you just bought spinach. Add it to your pantry, find a recipe that uses it, then save and share that recipe.</span></div>
        <p className="small muted" style={{ margin: 0 }}>Tap “Test task” at the top to check your progress.</p>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'startTour' })}>Show me around first</button>
        <button className="btn btn-ghost btn-block" onClick={() => dispatch({ type: 'skipTour' })}>Skip, take me to the app</button>
      </div>
    </div>
  );
}

export function TaskDoneModal() {
  const { state, dispatch } = useStore();
  if (!state.taskDone) return null;
  return (
    <div className="overlay center" style={{ zIndex: 35 }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="done-title">
        <div className="ph" style={{ height: 120 }}>celebration art</div>
        <h2 className="h2" id="done-title" style={{ fontSize: 22 }}>Test task complete!</h2>
        <p style={{ margin: 0 }}>Your spinach is saved from the bin, and a friend has a recipe to try. Thanks for testing.</p>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'closeDone' })}>Keep exploring</button>
      </div>
    </div>
  );
}
