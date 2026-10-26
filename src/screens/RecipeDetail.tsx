import { Check } from '../components/Check';
import { Icon } from '../components/Icon';
import { BackButton } from '../components/TopBar';
import { recipeDetail } from '../state/selectors';
import { useStore } from '../store';

export function RecipeDetail() {
  const { state, dispatch } = useStore();
  const rec = recipeDetail(state);
  return (
    <div className="screen">
      <div className="topbar">
        <BackButton /><p className="title" />
        <button className="icon-btn" onClick={() => dispatch({ type: 'toggleSave' })} aria-pressed={!!rec?.saved} aria-label="Save recipe">
          <Icon name="bookmark" style={{ fill: rec?.saved ? 'currentColor' : 'none' }} />
        </button>
        <button className="icon-btn" onClick={() => dispatch({ type: 'openShare' })} aria-label="Share recipe" aria-haspopup="dialog"><Icon name="share" /></button>
      </div>
      <div className="scroll" style={{ gap: 20 }}>
        <div className="ph" style={{ height: 180 }}>recipe photo</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 className="h1">{rec?.title}</h1>
          <span className="muted">{rec?.timeText} · Serves {rec?.serves} · by {rec?.by}</span>
          <span style={{ fontWeight: 600 }}>{rec?.haveLine}</span>
        </div>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'startCook' })}><Icon name="pot" size="sm" />Start cooking</button>
        <div className="section" style={{ gap: 0 }}>
          <h2 className="h2" style={{ marginBottom: 6 }}>Ingredients</h2>
          {rec?.ingRows.map((g) => (
            <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, padding: '6px 0', borderBottom: '1px solid #EFE3C2' }}>
              <Check on={g.on} />
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}><span>{g.name}</span><span className="small muted">{g.amt}</span></span>
              <span className={'small ' + g.noteCls}>{g.note}</span>
            </div>
          ))}
        </div>
        <div className="section">
          <h2 className="h2">Steps</h2>
          {rec?.stepRows.map((t) => (
            <div key={t.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}><span className="num">{t.n}</span><span style={{ paddingTop: 3 }}>{t.t}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
