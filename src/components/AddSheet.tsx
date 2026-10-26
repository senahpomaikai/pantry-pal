import { useStore } from '../store';
import { useVariantConfig } from '../variants';
import { Icon } from './Icon';
import { Sheet } from './Sheet';

export function AddSheet() {
  const { state, dispatch } = useStore();
  const { addSheetRecipes } = useVariantConfig();
  if (!state.addSheet) return null;
  const close = () => dispatch({ type: 'closeAdd' });
  return (
    <Sheet title="Add" label="Add" onClose={close}>
      <span className="small muted" style={{ fontWeight: 600, marginBottom: -8 }}>Groceries</span>
      <div className="group">
        <button className="lrow" onClick={() => dispatch({ type: 'go', screen: 'scan' })}><Icon name="scan" /><span className="grow">Scan an item</span></button>
        <button className="lrow" onClick={() => dispatch({ type: 'go', screen: 'manual' })}><Icon name="pencil" /><span className="grow">Type it in</span></button>
      </div>
      {addSheetRecipes && (
        <>
          <span className="small muted" style={{ fontWeight: 600, marginBottom: -8 }}>Recipes</span>
          <div className="group"><button className="lrow" onClick={() => dispatch({ type: 'goCreate' })}><Icon name="book" /><span className="grow">Write a recipe</span></button></div>
        </>
      )}
    </Sheet>
  );
}
