// Learn more https://docs.expo.io/guides/customizing-metro
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro loads this config as CommonJS at build time; it cannot be an ESM import.
const { getDefaultConfig } = require('expo/metro-config');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro loads this config as CommonJS at build time; it cannot be an ESM import.
const { withStorybook } = require('@storybook/react-native/withStorybook');

const config = getDefaultConfig(__dirname);

// Entry-point swapping (research/tools.md §React Native): when STORYBOOK_ENABLED=true,
// Metro's resolver redirects the project entry (index.ts) to .rnstorybook/index.tsx.
// No app code changes required either way.
module.exports = withStorybook(config, {
  websockets: 'auto',
});
