import { Icon } from '../components/Icon';
import { RecipeRow } from '../components/RecipeRow';
import { homeGoal, soonItems, topRecipes } from '../state/selectors';
import { useStore } from '../store';
import { REVISED } from '../variants';
import { Photo, foodPhoto } from '../components/Photo';
import { savingsStat } from '../state/v2';

/** v2: a fresh figure on every page load, so the welcome never goes stale. */
const SAVED = savingsStat();

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
        {REVISED ? (
          <section className="saved-card" aria-label={'Saved in the last ' + SAVED.period}>
            <span className="saved-kicker">Welcome back! In the last {SAVED.period}</span>
            <div className="saved-stats">
              <div><b>${SAVED.dollars}</b><span>saved</span></div>
              <div><b>{SAVED.lbs} lbs</b><span>food not wasted</span></div>
            </div>
            <span className="saved-foot"><Icon name="logo" size="xs" />That’s about {SAVED.meals} meals. Keep it up!</span>
          </section>
        ) : (
          <button className="btn btn-primary btn-block" style={{ minHeight: 56, fontSize: 17, marginTop: 4 }} onClick={() => dispatch({ type: 'go', screen: 'scan' })}>
            <Icon name="scan" />Scan groceries
          </button>
        )}

        <div className="section">
          <div className="sechead">
            <h2 className="h2">Expiring soon</h2>
            <button className="link" aria-label="See whole pantry" onClick={() => dispatch({ type: 'go', screen: 'pantry' })}>See all<Icon name="chevron" size="sm" /></button>
          </div>
          {soon.length > 0 ? (
            <div className="hscroll">
              {soon.map((p) => (
                <button key={p.id} className="mini" onClick={() => dispatch({ type: 'go', screen: 'item', itemId: p.id })}>
                  {REVISED ? <Photo src={foodPhoto(p.name)} style={{ height: 64 }} label="food" /> : <div className="ph" style={{ height: 64 }}>food</div>}
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span className="tag warn" style={{ alignSelf: 'flex-start' }}>{p.exp}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ margin: 0 }}>Nothing is close to expiring.</p>
          )}
          {soon.length > 0 && !REVISED && <button className="btn btn-block" onClick={() => dispatch({ type: 'cookExpiring' })}><Icon name="pot" size="sm" />Cook what’s expiring</button>}
        </div>

        {REVISED ? (
          <div className="section" style={{ gap: 8 }}>
            <h2 className="h2">Quick actions</h2>
            <div className="quick">
              <button className="qtile" disabled={soon.length === 0} onClick={() => dispatch({ type: 'goCombo', ids: soon.map((p) => p.id) })}>
                <Icon name="pot" />Cook expiring{soon.length > 0 && <span className="qbadge">{soon.length}</span>}
              </button>
              <button className="qtile" onClick={() => dispatch({ type: 'go', screen: 'shopping' })}>
                <Icon name="goals" />Shopping list{state.shopping.length > 0 && <span className="qbadge">{state.shopping.length}</span>}
              </button>
              <button className="qtile" onClick={() => dispatch({ type: 'goCombo', ids: [] })}><Icon name="plus" />Combine items</button>
              <button className="qtile" onClick={() => dispatch({ type: 'go', screen: 'goals' })}>
                <Icon name="task" />{goal.title}{goal.right && <span className="qbadge">{goal.right}</span>}
              </button>
            </div>
          </div>
        ) : (
          <button className="lrow sky" onClick={() => dispatch({ type: 'go', screen: 'goals' })}>
            <Icon name="goals" size="sm" /><span className="grow">{goal.title}</span><span className="small muted">{goal.right}</span><Icon name="chevron" size="sm" />
          </button>
        )}

        <div className="section">
          <div className="sechead">
            <h2 className="h2">Cook with what you have</h2>
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
