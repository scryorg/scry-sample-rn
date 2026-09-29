import { StyleSheet, Text } from 'react-native';
import { Button } from '../components/Button';
import { MenuItem } from '../components/MenuItem';
import { menuItems as allMenuItems, type MenuItemData } from '../data';
import { At, Screen } from '../Screen';
import { color, type } from '../tokens';

const styles = StyleSheet.create({
  title: { ...type(700, 28, 34), color: color.ink },
  subtitle: { ...type(400, 15, 20), color: color.muted },
  list: { gap: 12 },
});

export function Menu({ items = allMenuItems }: { items?: MenuItemData[] }) {
  return (
    <Screen label="Menu">
      <At y={56}>
        <Text style={styles.title}>Menu</Text>
      </At>
      <At y={94}>
        <Text style={styles.subtitle}>Order ahead, skip the line</Text>
      </At>
      <At y={138} style={styles.list}>
        {items.map((item) => (
          <MenuItem key={item.itemName} {...item} />
        ))}
      </At>
      <At y={758}>
        <Button variant="primary" label="View order · 2 items" />
      </At>
    </Screen>
  );
}
