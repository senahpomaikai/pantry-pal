import type { ReactElement } from 'react';
import { AddSheet } from './components/AddSheet';
import { Onboarding, TaskDoneModal, TaskSheet, TopStrip, WelcomeNotice } from './components/Chrome';
import { ShareSheet } from './components/ShareSheet';
import { TabBar } from './components/TabBar';
import { Toast } from './components/Toast';
import { About } from './screens/About';
import { AddItem } from './screens/AddItem';
import { CookMode } from './screens/CookMode';
import { Diet } from './screens/Diet';
import { Goals } from './screens/Goals';
import { Home } from './screens/Home';
import { ItemDetail } from './screens/ItemDetail';
import { Me } from './screens/Me';
import { Notifications } from './screens/Notifications';
import { Pantry } from './screens/Pantry';
import { RecipeDetail } from './screens/RecipeDetail';
import { Recipes } from './screens/Recipes';
import { Reminders } from './screens/Reminders';
import { Scan, ScanResult } from './screens/Scan';
import { Shared } from './screens/Shared';
import { UseUp } from './screens/UseUp';
import { WriteRecipe } from './screens/WriteRecipe';
import type { ScreenName } from './state/types';
import { useStore } from './store';
import { useFlags } from './variants';

const SCREENS: Record<ScreenName, () => ReactElement> = {
  home: Home, pantry: Pantry, item: ItemDetail, scan: Scan, scanResult: ScanResult, manual: AddItem,
  recipes: Recipes, recipe: RecipeDetail, cook: CookMode, useup: UseUp, create: WriteRecipe,
  shared: Shared, notifs: Notifications, profile: Me, goals: Goals, reminders: Reminders, diet: Diet, help: About,
};

export function App() {
  const { state } = useStore();
  const { task, variant } = useFlags();
  const Screen = SCREENS[state.screen];
  return (
    <div className={'app' + (task ? '' : ' no-strip')} data-variant={variant}>
      {task && <TopStrip />}
      <Screen />
      <TabBar />
      <AddSheet />
      <ShareSheet />
      {task && <TaskSheet />}
      <Onboarding />
      {task && <WelcomeNotice />}
      {task && <TaskDoneModal />}
      <Toast />
    </div>
  );
}
