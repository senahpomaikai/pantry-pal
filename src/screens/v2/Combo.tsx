// v2: pick several items (for example spinach AND chicken) and find one recipe that uses them together.
import { Icon } from '../../components/Icon';
import { RecipeRow } from '../../components/RecipeRow';
import { BackButton } from '../../components/TopBar';
import { sortedPantry } from '../../state/selectors';
import { comboRecipes } from '../../state/v2';
import { useStore } from '../../store';

export function Combo() {
  const { state, dispatch } = useStore();
  const items = sortedPantry(state.pantry);
  const list = comboRecipes(state);
  const n = state.pick.length;
  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">Cook with these</p></div>
      <div className="scroll" style={{ gap: 14 }}>
        <p className="lead" id="combo-label">Pick everything you want to use up. We’ll find recipes that use them together.</p>
        <div className="chips" role="group" aria-labelledby="combo-label">
          {items.map((p) => {
            const on = state.pick.includes(p.id);
            return (
              <button key={p.id} className={'chip ' + (on ? 'on' : '') + (p.days <= 3 ? ' soonchip' : '')} aria-pressed={on} onClick={() => dispatch({ type: 'togglePick', id: p.id })}>
                {p.days <= 3 && <Icon name="clock" size="xs" />}{p.name}
              </button>
            );
          })}
        </div>
        <h2 className="h2" style={{ marginTop: 4 }}>{n === 0 ? 'Pick at least one item' : list.length + ' recipe' + (list.length === 1 ? '' : 's') + ' for ' + n + ' item' + (n === 1 ? '' : 's')}</h2>
        {list.map((r) => (
          <div key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {n > 1 && <span className={'combotag ' + (r.usesAll ? 'all' : '')}>{r.usesAll ? 'Uses all ' + n : 'Uses ' + r.uses.length + ' of ' + n}: {r.uses.join(' + ').toLowerCase()}</span>}
            <RecipeRow r={r} onOpen={() => dispatch({ type: 'go', screen: 'recipe', recipeId: r.id })} />
          </div>
        ))}
        {n > 0 && list.length === 0 && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="h3">No recipe uses these yet</span>
            <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => dispatch({ type: 'goCreate' })}>Write your own</button>
          </div>
        )}
      </div>
    </div>
  );
}
