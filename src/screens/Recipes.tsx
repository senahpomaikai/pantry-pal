import { ChipGroup } from '../components/Chip';
import { Icon } from '../components/Icon';
import { RecipeRow } from '../components/RecipeRow';
import { BackButton } from '../components/TopBar';
import { RECIPE_FILTERS, recipeList } from '../state/selectors';
import type { Seg } from '../state/types';
import { useStore } from '../store';

const SEGS: [Seg, string][] = [['discover', 'Discover'], ['saved', 'Saved'], ['mine', 'Mine']];

export function Recipes() {
  const { state, dispatch } = useStore();
  const { list, emptyTitle, emptyText } = recipeList(state);
  const F = state.filters;
  const mine = state.seg === 'mine';
  return (
    <div className="screen">
      <div className="topbar">{state.stack.length > 0 && <BackButton />}<p className="title">Recipes</p></div>
      <div className="scroll" style={{ gap: 14 }}>
        <div className="seg" role="group" aria-label="Recipe lists">
          {SEGS.map(([v, label]) => (
            <button key={v} className={state.seg === v ? 'on' : ''} aria-pressed={state.seg === v} onClick={() => dispatch({ type: 'setSeg', seg: v })}>{label}</button>
          ))}
        </div>
        {!mine && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                <label htmlFor="q" className="sr">Search recipes or ingredients</label>
                <input id="q" className="input" style={{ paddingLeft: 44 }} placeholder="Search recipes" value={state.q} onChange={(e) => dispatch({ type: 'setQ', q: e.target.value })} />
                <Icon name="search" className="muted" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
              <button className="btn filterbtn" aria-expanded={state.filtersOpen} aria-controls="filter-panel"
                aria-label={F.length ? 'Filters, ' + F.length + ' on' : 'Filters'} onClick={() => dispatch({ type: 'toggleFilters' })}>
                <Icon name="filter" size="sm" />Filters{F.length > 0 && <span className="cbadge">{F.length}</span>}
              </button>
            </div>
            <div className={'acc ' + (state.filtersOpen ? 'open' : '')} id="filter-panel">
              <div className="acc-in">
                <div className="acc-body">
                  <ChipGroup label="Recipe filters" options={RECIPE_FILTERS.map(([v, label]) => ({ value: v, label, on: F.indexOf(v) >= 0 }))}
                    onPick={(key) => dispatch({ type: 'toggleFilter', key })} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    {state.diet.length === 0
                      ? <span className="small muted" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>No food preferences saved.<button className="link" onClick={() => dispatch({ type: 'go', screen: 'diet' })}>Set them</button></span>
                      : <span />}
                    <button className="link" disabled={F.length === 0} onClick={() => dispatch({ type: 'clearFilters' })}>Clear filters</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {mine && (
          <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'goCreate' })}><Icon name="plus" size="sm" />Write a new recipe</button>
        )}
        {list.map((r) => <RecipeRow key={r.id} r={r} showSoon onOpen={() => dispatch({ type: 'go', screen: 'recipe', recipeId: r.id })} />)}
        {list.length === 0 && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="h3">{emptyTitle}</span><span className="muted">{emptyText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
