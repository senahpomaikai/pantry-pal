import { RecipeRow } from '../components/RecipeRow';
import { BackButton } from '../components/TopBar';
import { friendRecipes, sentRecipes } from '../state/selectors';
import { useStore } from '../store';

export function Shared() {
  const { state, dispatch } = useStore();
  const sent = sentRecipes(state);
  const open = (recipeId: string) => dispatch({ type: 'go', screen: 'recipe', recipeId });
  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">Shared with me</p></div>
      <div className="scroll" style={{ gap: 12 }}>
        {friendRecipes(state.pantry).map((r) => <RecipeRow key={r.id} r={r} showFrom onOpen={() => open(r.id)} />)}
        {sent.length > 0 && (
          <div className="section">
            <h2 className="h2">You shared</h2>
            <div className="group">
              {sent.map((r) => <button key={r.id} className="lrow" onClick={() => open(r.id)}><span className="grow">{r.title}</span><span className="tag">sent</span></button>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
