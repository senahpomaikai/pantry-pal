import { Icon } from '../components/Icon';
import { RecipeRow } from '../components/RecipeRow';
import { BackButton } from '../components/TopBar';
import { itemView } from '../state/selectors';
import { useStore } from '../store';

export function ItemDetail() {
  const { state, dispatch } = useStore();
  const item = itemView(state);
  const recipes = item?.recipes ?? [];
  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">{item?.name}</p></div>
      <div className="scroll">
        <div className="ph" style={{ height: 150 }}>photo of item</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="h2">{item?.name}</span><span className="muted">{item?.sub}</span></div>
          <span className={'tag ' + (item?.tagCls ?? '')} style={{ fontSize: 14 }}>{item?.expLong}</span>
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'markItem', kind: 'used' })}><Icon name="check" size="sm" />I used it</button>
          <button className="btn btn-ghost" onClick={() => dispatch({ type: 'markItem', kind: 'tossed' })}><Icon name="trash" size="sm" />I tossed it</button>
        </div>
        <div className="section">
          <h2 className="h2">Recipes with {item?.lower}</h2>
          {recipes.map((r) => <RecipeRow key={r.id} r={r} onOpen={() => dispatch({ type: 'go', screen: 'recipe', recipeId: r.id })} />)}
          {recipes.length === 0 && (
            <>
              <p className="muted" style={{ margin: 0 }}>No recipes yet.</p>
              <button className="btn" onClick={() => dispatch({ type: 'goCreate' })}>Write a recipe</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
