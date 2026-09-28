import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, insideBorder, radius, type } from '../tokens';
import { pressFeedback, SCRY_ROOT_TEST_ID } from '../capture';

export interface MenuItemProps {
  /** Drink name, the first line of the middle column. */
  itemName: string;
  description: string;
  price: string;
  /** Fill of the 56 x 56 tile, one of the tile tokens. */
  tileColor: string;
  onPress?: () => void;
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: 350,
    height: 88,
    padding: 16,
    backgroundColor: color.surface,
    borderRadius: radius.card,
    ...insideBorder(),
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 56,
    height: 56,
    borderRadius: radius.tile,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: color.glow,
  },
  middle: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  name: { ...type(600, 16, 22), color: color.ink },
  description: { ...type(400, 13, 18), color: color.muted },
  price: { ...type(600, 15, 20), color: color.caramel, flexShrink: 0 },
});

export function MenuItem({ itemName, description, price, tileColor, onPress }: MenuItemProps) {
  return (
    <Pressable testID={SCRY_ROOT_TEST_ID} style={styles.root} onPress={onPress} {...pressFeedback}>
      <View style={[styles.tile, { backgroundColor: tileColor }]}>
        <View style={styles.circle} />
      </View>
      <View style={styles.middle}>
        <Text numberOfLines={1} style={styles.name}>
          {itemName}
        </Text>
        <Text numberOfLines={1} style={styles.description}>
          {description}
        </Text>
      </View>
      <Text numberOfLines={1} style={styles.price}>
        {price}
      </Text>
    </Pressable>
  );
}
