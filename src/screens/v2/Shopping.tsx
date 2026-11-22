// v2: a shopping list that checks the pantry, so you don't buy what you already have.
import { Icon } from '../../components/Icon';
import { BackButton } from '../../components/TopBar';
import { duplicateOf, dupLine } from '../../state/v2';
import { useStore } from '../../store';

export function Shopping() {
  const { state, dispatch } = useStore();
  const typed = state.shopText.trim();
  const typedDup = duplicateOf(state.pantry, typed);
  return (
    <div className="screen">
      <div className="topbar">{state.stack.length > 0 && <BackButton />}<p className="title">Shopping list</p></div>
      <div className="scroll">
        <div className="field">
          <label className="label" htmlFor="shop-q">At the store? Check before you buy</label>
          <form style={{ display: 'flex', gap: 8 }} onSubmit={(e) => { e.preventDefault(); dispatch({ type: 'addShop' }); }}>
            <input id="shop-q" className="input" placeholder="e.g. Eggs" autoComplete="off" value={state.shopText}
              onChange={(e) => dispatch({ type: 'setShopText', text: e.target.value })} />
            <button className="btn btn-primary" style={{ flex: 'none' }} disabled={!typed}>Add</button>
          </form>
          {typed && (typedDup
            ? <span className="dupwarn" role="status"><Icon name="alert" size="sm" />{dupLine(typedDup)}</span>
            : <span className="small muted" role="status">Not in your pantry.</span>)}
        </div>
        <div className="group">
          {state.shopping.map((n) => {
            const dup = duplicateOf(state.pantry, n);
            return (
              <div key={n} className="lrow shoprow">
                <span className="grow" style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
                  <span style={{ fontWeight: 600 }}>{n}</span>
                  {dup && <span className="dupnote"><Icon name="alert" size="xs" />Already have it: {dup.qty ? dup.qty + ', ' : ''}{dup.loc}</span>}
                </span>
                <button className="icon-btn" aria-label={'Remove ' + n} onClick={() => dispatch({ type: 'removeShop', name: n })}><Icon name="check" /></button>
              </div>
            );
          })}
        </div>
        {state.shopping.length === 0 && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="h3">Your list is empty</span>
            <span className="muted">Add items here, or tap “Add missing to my list” on any recipe.</span>
          </div>
        )}
        <span className="small muted" style={{ textAlign: 'center' }}>Shared with your household of {state.household}, so nobody buys the same thing twice.</span>
      </div>
    </div>
  );
}
