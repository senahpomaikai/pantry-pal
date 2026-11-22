// v2: bring in a recipe you already use, from a link.
import { Icon } from '../../components/Icon';
import { BackButton } from '../../components/TopBar';
import { useStore } from '../../store';

export function Import() {
  const { state, dispatch } = useStore();
  const empty = !state.importUrl.trim();
  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">Import a recipe</p></div>
      <form className="scroll" onSubmit={(e) => { e.preventDefault(); dispatch({ type: 'importRecipe' }); }}>
        <p className="lead">Paste a link from any recipe site, blog or video. We’ll pull in the ingredients and steps and match them to your pantry.</p>
        <div className="field">
          <label className="label" htmlFor="imp-url">Recipe link</label>
          <input id="imp-url" className="input" inputMode="url" autoComplete="off" placeholder="e.g. allrecipes.com/garlic-pasta" value={state.importUrl}
            onChange={(e) => dispatch({ type: 'setImportUrl', url: e.target.value })} />
          <button type="button" className="action" style={{ alignSelf: 'flex-start' }} onClick={() => dispatch({ type: 'setImportUrl', url: 'https://www.example-recipes.com/garlicky-greens-pasta' })}>Use a sample link</button>
        </div>
        <button className="btn btn-primary btn-block" disabled={empty}><Icon name="link" size="sm" />Import recipe</button>
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'goCreate' })}>Or write one yourself</button>
      </form>
    </div>
  );
}
