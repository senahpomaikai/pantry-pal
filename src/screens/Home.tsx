import { Icon } from '../components/Icon';
import { RecipeRow } from '../components/RecipeRow';
import { homeGoal, soonItems, topRecipes } from '../state/selectors';
import { useStore } from '../store';

export function Home() {
  const { state, dispatch } = useStore();
  const soon = soonItems(state.pantry);
  const goal = homeGoal(state);
  return (
    <div className="screen">
      <div className="topbar">
        <Icon name="logo" style={{ color: '#1D3B28', marginLeft: 6 }} />
        <p className="title">Pantry Pal</p>
        <button className="icon-btn" onClick={() => dispatch({ type: 'go', screen: 'notifs' })} aria-label="Notifications">
          <Icon name="bell" />
          {soon.length > 0 && <span className="badge">{soon.length}</span>}
        </button>
      </div>
      <div className="scroll">
        <button className="btn btn-primary btn-block" style={{ minHeight: 56, fontSize: 17, marginTop: 4 }} onClick={() => dispatch({ type: 'go', screen: 'scan' })}>
          <Icon name="scan" />Scan groceries
        </button>

        <div className="section">
          <div className="sechead">
            <h2 className="h2">Use these soon</h2>
            <button className="link" aria-label="See whole pantry" onClick={() => dispatch({ type: 'go', screen: 'pantry' })}>See all<Icon name="chevron" size="sm" /></button>
          </div>
          {soon.length > 0 ? (
            <div className="hscroll">
              {soon.map((p) => (
                <button key={p.id} className="mini" onClick={() => dispatch({ type: 'go', screen: 'item', itemId: p.id })}>
                  <div className="ph" style={{ height: 64 }}>food</div>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span className="tag warn" style={{ alignSelf: 'flex-start' }}>{p.exp}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ margin: 0 }}>Nothing is close to expiring.</p>
          )}
        </div>

        <button className="lrow sky" onClick={() => dispatch({ type: 'go', screen: 'goals' })}>
          <Icon name="goals" size="sm" /><span className="grow">{goal.title}</span><span className="small muted">{goal.right}</span><Icon name="chevron" size="sm" />
        </button>

        <div className="section">
          <div className="sechead">
            <h2 className="h2">You can cook now</h2>
            <button className="link" aria-label="See all recipes" onClick={() => dispatch({ type: 'go', screen: 'recipes' })}>See all<Icon name="chevron" size="sm" /></button>
          </div>
          {topRecipes(state).map((r) => (
            <RecipeRow key={r.id} r={r} showSoon onOpen={() => dispatch({ type: 'go', screen: 'recipe', recipeId: r.id })} />
          ))}
        </div>
      </div>
    </div>
  );
}
