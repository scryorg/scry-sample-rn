import type { Preview } from '@storybook/react-native';
import { CAPTURE_MODE } from '../src/capture';
import { ScryProbe } from './scryProbe';

const preview: Preview = {
  parameters: {
    // Capture builds: no safe-area padding, so a 390x844 screen story starts at the top of the
    // display and is not clipped by the bottom inset (the status bar is hidden by Storybook).
    noSafeArea: CAPTURE_MODE,
    controls: {
      matchers: {
        color: /(background|color)$/i,
      },
    },
  },
  // Capture builds only (EXPO_PUBLIC_SCRY_CAPTURE=1): the dev-only probe `scry capture rn`
  // asks for the story's crop bounds and rn-fiber structure tree. It adds no view.
  decorators: CAPTURE_MODE ? [(Story) => <ScryProbe><Story /></ScryProbe>] : [],
};

export default preview;
