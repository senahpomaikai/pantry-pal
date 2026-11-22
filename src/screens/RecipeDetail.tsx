import { Check } from '../components/Check';
import { Icon } from '../components/Icon';
import { BackButton } from '../components/TopBar';
import { recipeDetail } from '../state/selectors';
import { useStore } from '../store';
import { REVISED } from '../variants';
import { Photo, recipePhoto } from '../components/Photo';
import { findRecipe } from '../state/selectors';
import { missingFor, videoLength } from '../state/v2';

export function RecipeDetail() {
  const { state, dispatch } = useStore();
  const rec = recipeDetail(state);
  const raw = findRecipe(state, state.recipeId);
  const missing = raw ? missingFor(state.pantry, raw) : [];
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
        {REVISED && rec ? (
          <button className="recipe-hero" onClick={() => dispatch({ type: 'videoNope' })} aria-label={'Play ' + videoLength(rec)}>
            <Photo src={recipePhoto(rec.id, rec.ings[0])} style={{ height: 180, width: '100%' }} />
            <span className="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg></span>
            <span className="vlen">{videoLength(rec)}</span>
          </button>
        ) : <div className="ph" style={{ height: 180 }}>recipe photo</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 className="h1">{rec?.title}</h1>
          <span className="muted">{rec?.timeText} · Serves {rec?.serves} · by {rec?.by}</span>
          <span style={{ fontWeight: 600 }}>{rec?.haveLine}</span>
        </div>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'startCook' })}><Icon name="pot" size="sm" />Start cooking</button>
        <div className="section" style={{ gap: 0 }}>
          <h2 className="h2" style={{ marginBottom: 6 }}>Ingredients</h2>
          {REVISED && missing.length > 0 && (
            missing.every((n) => state.shopping.some((x) => x.toLowerCase() === n.toLowerCase()))
              ? <button className="btn" style={{ marginBottom: 6 }} onClick={() => dispatch({ type: 'go', screen: 'shopping' })}><Icon name="check" size="sm" />On your shopping list</button>
              : <button className="btn" style={{ marginBottom: 6 }} onClick={() => dispatch({ type: 'addMissing' })}><Icon name="plus" size="sm" />Add {missing.length} missing to my shopping list</button>
          )}
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
