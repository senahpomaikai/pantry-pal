import { showTabs, tabGroup } from '../state/selectors';
import type { TabName } from '../state/types';
import { useStore } from '../store';
import { useVariantConfig } from '../variants';
import { Icon, type IconName } from './Icon';

const TABS: [TabName, string, IconName][] = [['home', 'Home', 'home'], ['pantry', 'Pantry', 'pantry'], ['recipes', 'Recipes', 'book'], ['profile', 'Me', 'user']];

export function TabBar() {
  const { state, dispatch } = useStore();
  const { addTab } = useVariantConfig();
  if (!showTabs(state.screen)) return null;
  const group = tabGroup(state.screen);
  const tab = ([t, label, icon]: (typeof TABS)[number]) => (
    <button key={t} className={'tab ' + (group === t ? 'on' : '')} aria-current={group === t ? 'page' : undefined} onClick={() => dispatch({ type: 'tab', tab: t })}>
      <Icon name={icon} />{label}
    </button>
  );
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.slice(0, 2).map(tab)}
      {/* Variant A: centre "+" opens the Add sheet. Variant B removes it (see variants.ts). */}
      {addTab && (
        <button className="tab" onClick={() => dispatch({ type: 'openAdd' })} aria-label="Add" aria-haspopup="dialog">
          <span className="addbtn"><Icon name="plus" /></span>Add
        </button>
      )}
      {TABS.slice(2).map(tab)}
    </nav>
  );
}
