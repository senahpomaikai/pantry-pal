import { useStore } from '../store';
import { REVISED } from '../variants';
import { Icon } from './Icon';
import { Sheet } from './Sheet';

export function AddSheet() {
  const { state, dispatch } = useStore();
  if (!state.addSheet) return null;
  const close = () => dispatch({ type: 'closeAdd' });
  return (
    <Sheet title="Add" label="Add" onClose={close}>
      <span className="small muted" style={{ fontWeight: 600, marginBottom: -8 }}>Groceries</span>
      <div className="group">
        <button className="lrow" onClick={() => dispatch({ type: 'go', screen: 'scan' })}><Icon name="scan" /><span className="grow">Scan an item</span></button>
        {REVISED && <button className="lrow" onClick={() => dispatch({ type: 'go', screen: 'receipt' })}><Icon name="task" /><span className="grow">Scan receipt</span></button>}
        <button className="lrow" onClick={() => dispatch({ type: 'go', screen: 'manual' })}><Icon name="pencil" /><span className="grow">Type it in</span></button>
        {REVISED && <button className="lrow" onClick={() => dispatch({ type: 'go', screen: 'shopping' })}><Icon name="goals" /><span className="grow">Shopping list</span></button>}
      </div>
      <span className="small muted" style={{ fontWeight: 600, marginBottom: -8 }}>Recipes</span>
      <div className="group"><button className="lrow" onClick={() => dispatch({ type: 'goCreate' })}><Icon name="book" /><span className="grow">Write a recipe</span></button>
        {REVISED && <button className="lrow" onClick={() => dispatch({ type: 'go', screen: 'import' })}><Icon name="link" /><span className="grow">Import recipe</span></button>}</div>
    </Sheet>
  );
}
