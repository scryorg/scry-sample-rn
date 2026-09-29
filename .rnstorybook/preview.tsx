import type { Preview } from '@storybook/react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CAPTURE_MODE } from '../src/capture';
import { ScryProbe } from './scryProbe';

// Components render at the top of the display, where the iPhone Dynamic Island / notch (a hardware
// overlay that is part of every simulator screenshot) would cover them and hide their text. Every
// component story is wrapped in a top-edge SafeAreaView so it starts below the island. Screen
// stories are full 390x844 device designs with their own (empty) status band: pushing them down
// would cut their bottom off, so they opt out (`parameters.scrySafeArea: false`, or a `Screens/`
// title). `scry capture rn` still flags any capture whose root starts inside the unsafe area.
const withSafeArea: NonNullable<Preview['decorators']>[number] = (Story, context) => {
  const isScreen = context.parameters?.scrySafeArea === false || /^screens?\//i.test(context.title ?? '');
  if (isScreen) return <Story />;
  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top']}>
        <Story />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

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
  decorators: [withSafeArea, ...(CAPTURE_MODE ? [(Story: () => JSX.Element) => <ScryProbe><Story /></ScryProbe>] : [])],
};

export default preview;
