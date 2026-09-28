import type { GestureResponderEvent } from 'react-native';
import { Pressable, StyleSheet, Text } from 'react-native';
import { color, insideBorder, radius, type } from '../tokens';
import { pressFeedback, SCRY_ROOT_TEST_ID } from '../capture';

export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onPress?: (event: GestureResponderEvent) => void;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    borderRadius: radius.button,
  },
  primary: {
    backgroundColor: color.espresso,
  },
  secondary: {
    backgroundColor: color.surface,
    ...insideBorder(),
  },
  labelPrimary: {
    ...type(600, 16, 20),
    color: color.white,
  },
  labelSecondary: {
    ...type(600, 16, 20),
    color: color.ink,
  },
});

export function Button({ label, variant = 'primary', onPress }: ButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      testID={SCRY_ROOT_TEST_ID}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.base, isPrimary ? styles.primary : styles.secondary]}
      {...pressFeedback}
    >
      <Text numberOfLines={1} style={isPrimary ? styles.labelPrimary : styles.labelSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}
