// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/withStorybook');

const config = getDefaultConfig(__dirname);

// Entry-point swapping (research/tools.md §React Native): when STORYBOOK_ENABLED=true,
// Metro's resolver redirects the project entry (index.ts) to .rnstorybook/index.tsx.
// No app code changes required either way.
module.exports = withStorybook(config, {
  websockets: 'auto',
});
