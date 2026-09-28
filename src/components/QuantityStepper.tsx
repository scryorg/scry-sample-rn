import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, insideBorder, radius, type } from '../tokens';
import { pressFeedback, SCRY_ROOT_TEST_ID } from '../capture';

export interface QuantityStepperProps {
  count: number;
  onDecrement?: () => void;
  onIncrement?: () => void;
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    width: 128,
    height: 44,
    backgroundColor: color.surface,
    borderRadius: radius.stepper,
    ...insideBorder(),
  },
  cell: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Bars are drawn, not typed, so the glyphs match Figma pixel for pixel: 14 x 2 (and
  // 2 x 14 for the plus), radius 1, centred in a 44 x 44 cell.
  horizontalBar: {
    position: 'absolute',
    left: 15,
    top: 21,
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: color.ink,
  },
  verticalBar: {
    position: 'absolute',
    left: 21,
    top: 15,
    width: 2,
    height: 14,
    borderRadius: 1,
    backgroundColor: color.ink,
  },
  countCell: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { ...type(600, 16, 20), color: color.ink },
});

export function QuantityStepper({ count, onDecrement, onIncrement }: QuantityStepperProps) {
  return (
    <View testID={SCRY_ROOT_TEST_ID} style={styles.root}>
      <Pressable
        accessibilityLabel="Decrease quantity"
        accessibilityRole="button"
        style={styles.cell}
        onPress={onDecrement}
        {...pressFeedback}
      >
        <View style={styles.horizontalBar} />
      </Pressable>
      <View style={styles.countCell}>
        <Text style={styles.count}>{count}</Text>
      </View>
      <Pressable
        accessibilityLabel="Increase quantity"
        accessibilityRole="button"
        style={styles.cell}
        onPress={onIncrement}
        {...pressFeedback}
      >
        <View style={styles.horizontalBar} />
        <View style={styles.verticalBar} />
      </Pressable>
    </View>
  );
}
