import type { ReactElement } from 'react';
import { AddSheet } from './components/AddSheet';
import { TabBar } from './components/TabBar';
import { Toast } from './components/Toast';
import { AddItem } from './screens/AddItem';
import { CookMode } from './screens/CookMode';
import { Home } from './screens/Home';
import { ItemDetail } from './screens/ItemDetail';
import { Pantry } from './screens/Pantry';
import { RecipeDetail } from './screens/RecipeDetail';
import { Recipes } from './screens/Recipes';
import { Scan, ScanResult } from './screens/Scan';
import { UseUp } from './screens/UseUp';
import type { ScreenName } from './state/types';
import { useStore } from './store';

const SCREENS: Partial<Record<ScreenName, () => ReactElement>> = {
  home: Home, pantry: Pantry, item: ItemDetail, scan: Scan, scanResult: ScanResult, manual: AddItem,
  recipes: Recipes, recipe: RecipeDetail, cook: CookMode, useup: UseUp,
};

export function App() {
  const { state } = useStore();
  const Screen = SCREENS[state.screen] ?? Home;
  return (
    <div className="app">
      <Screen />
      <TabBar />
      <AddSheet />
      <Toast />
    </div>
  );
}
