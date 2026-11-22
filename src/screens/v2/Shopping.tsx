// v2: a shopping list that checks the pantry, so you don't buy what you already have.
import { Check } from '../../components/Check';
import { Icon } from '../../components/Icon';
import { BackButton } from '../../components/TopBar';
import { FRIENDS } from '../../state/seed';
import { duplicateOf, dupLine } from '../../state/v2';
import { useStore } from '../../store';

const SHARE_GROUPS: [string, string[]][] = [['Family', ['Household']], ['Groups', ['Roommates', 'Book club']], ['Friends', FRIENDS]];

function ShareMenu() {
  const { state, dispatch } = useStore();
  return (
    <div className="sharemenu" role="dialog" aria-label="Share list">
      {SHARE_GROUPS.map(([group, names]) => (
        <div key={group} className="sharegroup">
          <span className="small muted" style={{ fontWeight: 600 }}>{group}</span>
          {names.map((name) => {
            const on = state.listShareTo.includes(name);
            return (
              <button key={name} className="sharerow" aria-pressed={on} onClick={() => dispatch({ type: 'toggleListShareTo', name })}>
                <span className="avatar">{name[0]}</span><span className="grow">{name}</span><Check on={on} />
              </button>
            );
          })}
        </div>
      ))}
      <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'toggleListShare' })}>Done</button>
    </div>
  );
}

export function Shopping() {
  const { state, dispatch } = useStore();
  const typed = state.shopText.trim();
  const typedDup = duplicateOf(state.pantry, typed);
  const shared = state.listShareTo;
  return (
    <div className="screen">
      <div className="topbar" style={{ position: 'relative' }}>
        {state.stack.length > 0 && <BackButton />}
        <p className="title">Shopping list</p>
        <button className={'icon-btn' + (shared.length ? ' on' : '')} aria-label="Share list" aria-expanded={state.listShareOpen} onClick={() => dispatch({ type: 'toggleListShare' })}><Icon name="share" /></button>
        {state.listShareOpen && <ShareMenu />}
      </div>
      <div className="scroll">
        {shared.length > 0 && (
          <div className="sharedwith">
            <span className="avatars">{shared.slice(0, 4).map((n) => <span key={n} className="avatar">{n[0]}</span>)}</span>
            <span className="small muted">{shared.join(', ')}</span>
          </div>
        )}
        <div className="field">
          <label className="sr" htmlFor="shop-q">Add or check an item</label>
          <form style={{ display: 'flex', gap: 8 }} onSubmit={(e) => { e.preventDefault(); dispatch({ type: 'addShop' }); }}>
            <input id="shop-q" className="input" placeholder="Add or check an item" autoComplete="off" value={state.shopText}
              onChange={(e) => dispatch({ type: 'setShopText', text: e.target.value })} />
            <button className="btn btn-primary" style={{ flex: 'none' }} disabled={!typed}>Add</button>
          </form>
          {typed && (typedDup
            ? <span className="dupwarn" role="status"><Icon name="alert" size="sm" />{dupLine(typedDup)}</span>
            : <span className="small muted" role="status">Not in pantry</span>)}
        </div>
        <div className="group">
          {state.shopping.map((n) => {
            const dup = duplicateOf(state.pantry, n);
            return (
              <div key={n} className="lrow shoprow">
                <span className="grow" style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
                  <span style={{ fontWeight: 600 }}>{n}</span>
                  {dup && <span className="dupnote"><Icon name="alert" size="xs" />{dupLine(dup)}</span>}
                </span>
                <button className="icon-btn" aria-label={'Got ' + n} onClick={() => dispatch({ type: 'removeShop', name: n })}><Icon name="check" /></button>
              </div>
            );
          })}
        </div>
        {state.shopping.length === 0 && <p className="muted" style={{ margin: 0, textAlign: 'center' }}>Your list is empty</p>}
      </div>
    </div>
  );
}
