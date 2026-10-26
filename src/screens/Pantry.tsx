import { ChipGroup, chipsOf } from '../components/Chip';
import { Icon } from '../components/Icon';
import { BackButton } from '../components/TopBar';
import { EXP_OPTIONS, locations, pantryFilterParts, pantryRows } from '../state/selectors';
import { useStore } from '../store';
import { useVariantConfig } from '../variants';

/** Variant B only: an Add button in the pantry header that opens the Add sheet. */
function PantryAddButton() {
  const { dispatch } = useStore();
  if (!useVariantConfig().pantryAddButton) return null;
  return (
    <button className="btn filterbtn" style={{ minHeight: 44 }} onClick={() => dispatch({ type: 'openAdd' })} aria-haspopup="dialog">
      <Icon name="plus" size="sm" />Add
    </button>
  );
}

export function Pantry() {
  const { state, dispatch } = useStore();
  const rows = pantryRows(state);
  const parts = pantryFilterParts(state);
  const count = parts.length;
  return (
    <div className="screen">
      <div className="topbar">
        {state.stack.length > 0 && <BackButton />}
        <p className="title">My pantry <span className="muted" style={{ fontWeight: 500, fontSize: 15 }}>({state.pantry.length})</span></p>
        <PantryAddButton />
        <button className="btn filterbtn" style={{ minHeight: 44 }} aria-expanded={state.pFiltersOpen} aria-controls="pantry-filters"
          aria-label={count ? 'Filters, ' + count + ' on' : 'Filters'} onClick={() => dispatch({ type: 'togglePFilters' })}>
          <Icon name="filter" size="sm" />Filters{count > 0 && <span className="cbadge">{count}</span>}
        </button>
      </div>
      <div className="scroll" style={{ gap: 12, paddingTop: 0 }}>
        <div className={'acc ' + (state.pFiltersOpen ? 'open' : '')} id="pantry-filters">
          <div className="acc-in">
            <div className="acc-body" style={{ paddingTop: 4 }}>
              <span className="small muted" style={{ fontWeight: 600 }} id="pf-where">Where</span>
              <ChipGroup labelledBy="pf-where" options={chipsOf(['All'].concat(locations(state)), state.loc)} onPick={(loc) => dispatch({ type: 'setLoc', loc })} />
              <span className="small muted" style={{ fontWeight: 600 }} id="pf-exp">Expires</span>
              <ChipGroup labelledBy="pf-exp" options={EXP_OPTIONS.map(([v, label]) => ({ value: v, label, on: state.exp === v }))} onPick={(exp) => dispatch({ type: 'setExp', exp })} />
            </div>
          </div>
        </div>
        {count > 0 && !state.pFiltersOpen && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span className="small muted">{parts.join(' · ')}</span>
            <button className="link" onClick={() => dispatch({ type: 'showAll' })}>Clear</button>
          </div>
        )}
        <div className="group">
          {rows.map((p) => (
            <button key={p.id} className="prow" onClick={() => dispatch({ type: 'go', screen: 'item', itemId: p.id })}>
              <div className="ph" style={{ width: 44, height: 44, borderRadius: 10 }} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span className="small muted">{p.sub}</span>
              </div>
              <span className={'tag ' + p.tagCls}>{p.exp}</span>
            </button>
          ))}
        </div>
        {state.pantry.length > 0 && rows.length === 0 && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            <span className="h3">Nothing matches</span>
            <button className="btn" onClick={() => dispatch({ type: 'showAll' })}>Show everything</button>
          </div>
        )}
        {state.pantry.length === 0 && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            <span className="h3">Nothing here yet</span>
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'go', screen: 'scan' })}>Scan an item</button>
          </div>
        )}
      </div>
    </div>
  );
}
