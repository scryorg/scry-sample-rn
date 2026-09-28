import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { color } from './tokens';
import { SCRY_ROOT_TEST_ID } from './capture';

const styles = StyleSheet.create({
  screen: {
    width: 390,
    height: 844,
    overflow: 'hidden',
    backgroundColor: color.bg,
  },
});

/** A 390 x 844 phone screen filled with `bg`. Carries the capture crop root. */
export function Screen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View accessibilityLabel={label} testID={SCRY_ROOT_TEST_ID} style={styles.screen}>
      {children}
    </View>
  );
}

/**
 * Places a block at an exact y from the top of the screen, inside the 20px side padding
 * (content width 350). Every y in SPEC.md maps to one of these.
 */
export function At({ y, children, style }: { y: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ position: 'absolute', left: 20, top: y, width: 350 }, style]}>{children}</View>;
}
