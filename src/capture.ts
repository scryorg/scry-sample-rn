// Capture determinism, shared by every component/screen so the `capture rn` adapter (PR 6)
// gets a stable, crop-able root and no animation drift between runs.
//
//   testID="scry-root"  — the adapter crops the screenshot to this view.
//   SCRY_CAPTURE=1       — turns off touch-feedback animations (Android ripple, Pressable
//                          opacity fades) so two captures of the same story are pixel-identical.
export const CAPTURE_MODE = process.env.EXPO_PUBLIC_SCRY_CAPTURE === '1';

export const SCRY_ROOT_TEST_ID = 'scry-root';

/** Pressable/TouchableOpacity press feedback, disabled under capture. */
export const pressFeedback = {
  activeOpacity: CAPTURE_MODE ? 1 : 0.7,
  android_ripple: CAPTURE_MODE ? undefined : { color: 'rgba(0,0,0,0.08)' },
};
