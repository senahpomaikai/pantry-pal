// v2: add a whole shop at once from a receipt photo or a store order, instead of one item at a time.
import { Check } from '../../components/Check';
import { Icon } from '../../components/Icon';
import { Photo, foodPhoto } from '../../components/Photo';
import { BackButton } from '../../components/TopBar';
import { dayFmt } from '../../state/selectors';
import { duplicateOf, sizeOptions } from '../../state/v2';
import { useStore } from '../../store';

export function Receipt() {
  const { state, dispatch } = useStore();
  const lines = state.receipt;
  const n = lines.filter((l) => l.on).length;

  if (!state.receiptSource) {
    return (
      <div className="screen">
        <div className="topbar"><BackButton /><p className="title">Add groceries</p></div>
        <div className="scroll">
          <div className="receipt-art" aria-hidden="true"><span className="note">receipt photo goes here<br />(not in this prototype)</span></div>
          <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'readReceipt', source: 'receipt' })}><Icon name="scan" size="sm" />Scan receipt</button>
          <button className="btn btn-block" onClick={() => dispatch({ type: 'readReceipt', source: 'store' })}><Icon name="link" size="sm" />Import store order</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">{state.receiptSource === 'store' ? 'Your store order' : 'From your receipt'}</p></div>
      <div className="scroll">
        <span className="small muted">{lines.length} items found</span>
        <div className="group receipt-list">
          {lines.map((l, i) => {
            const dup = duplicateOf(state.pantry, l.name);
            return (
              <div key={l.name} className="rline">
                <button className="rline-top" aria-pressed={l.on} onClick={() => dispatch({ type: 'toggleReceiptLine', index: i })}>
                  <Check on={l.on} />
                  <Photo src={foodPhoto(l.name)} style={{ width: 40, height: 40, borderRadius: 10 }} />
                  <span className="grow" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{l.name}</span>
                    <span className="small muted">{l.loc} · {dayFmt(l.days)}</span>
                  </span>
                </button>
                {dup && <span className="dupnote"><Icon name="info" size="xs" />Already have {dup.qty || 'some'}</span>}
                {l.on && (
                  <label className="rline-size">
                    <span className="small muted">Size</span>
                    <select className="input select" value={l.qty} onChange={(e) => dispatch({ type: 'setReceiptQty', index: i, qty: e.target.value })}>
                      {sizeOptions(l.name, l.qty).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>
                )}
              </div>
            );
          })}
        </div>
        <button className="btn btn-primary btn-block" disabled={n === 0} onClick={() => dispatch({ type: 'addReceipt' })}>Add {n} item{n === 1 ? '' : 's'} to my pantry</button>
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'go', screen: 'manual' })}>Type a missing item</button>
      </div>
    </div>
  );
}
