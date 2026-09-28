import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { QuantityStepper } from '../components/QuantityStepper';
import { itemDetailCopy, menuItems } from '../data';
import { At, Screen } from '../Screen';
import { color, radius, type } from '../tokens';

const styles = StyleSheet.create({
  back: { ...type(500, 15, 20), color: color.muted },
  hero: {
    height: 220,
    borderRadius: radius.hero,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: color.glow },
  title: { ...type(700, 26, 32), color: color.ink },
  price: { ...type(600, 18, 24), color: color.caramel },
  description: { ...type(400, 15, 22), color: color.muted },
  quantityRow: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityLabel: { ...type(500, 15, 20), color: color.ink },
});

export function ItemDetail({ itemName = 'Flat White' }: { itemName?: string }) {
  const item = menuItems.find((i) => i.itemName === itemName) ?? menuItems[0];
  const [line1, line2] = itemDetailCopy[item.itemName] ?? itemDetailCopy['Flat White'];
  return (
    <Screen label="Item Detail">
      <At y={56}>
        <Text style={styles.back}>Back</Text>
      </At>
      <At y={92} style={[styles.hero, { backgroundColor: item.tileColor }]}>
        <View style={styles.heroCircle} />
      </At>
      <At y={332}>
        <Text style={styles.title}>{item.itemName}</Text>
      </At>
      <At y={368}>
        <Text style={styles.price}>{item.price}</Text>
      </At>
      <At y={404}>
        {/* Two explicit lines, so the break matches the Figma text layer exactly. */}
        <Text style={styles.description}>{line1}</Text>
        <Text style={styles.description}>{line2}</Text>
      </At>
      <At y={480} style={styles.quantityRow}>
        <Text style={styles.quantityLabel}>Quantity</Text>
        <QuantityStepper count={1} />
      </At>
      <At y={758}>
        <Button variant="primary" label={`Add to order · ${item.price}`} />
      </At>
    </Screen>
  );
}
