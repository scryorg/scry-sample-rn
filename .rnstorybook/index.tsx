// This file is the app's bundle entry when Storybook is enabled (STORYBOOK_ENABLED=true).
// `withStorybook` swaps the Metro resolver from the project's `index.ts` to this file, so it
// registers a root component itself. See ../metro.config.js.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerRootComponent } from 'expo';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { view } from './storybook.requires';

const StorybookUIRoot = view.getStorybookUI({
  shouldPersistSelection: true,
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
  enableWebsockets: true,
});

// Inter is bundled (no system font fallback, per the capture-sources brief): hold the
// Storybook UI until every weight used by the Kettle stories has loaded.
function Root() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  if (!fontsLoaded) return null;
  return <StorybookUIRoot />;
}

registerRootComponent(Root);
