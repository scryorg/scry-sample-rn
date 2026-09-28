import type { StorybookConfig } from '@storybook/react-native';

// Exactly the Kettle stories under src/. No addons: this fixture is a non-visual build for
// the `capture rn` adapter and UAT, not a Storybook demo.
const main: StorybookConfig = {
  stories: ['../src/components/**/*.stories.?(ts|tsx)', '../src/screens/**/*.stories.?(ts|tsx)'],
  framework: '@storybook/react-native',
};

export default main;
