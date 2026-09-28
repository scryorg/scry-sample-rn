import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { At, Screen } from '../Screen';
import { color, insideBorder, radius, type } from '../tokens';

export interface OrderLine {
  name: string;
  quantity: string;
  price: string;
}

const defaultLines: OrderLine[] = [
  { name: 'Flat White', quantity: '×1', price: '$4.50' },
  { name: 'Cold Brew', quantity: '×1', price: '$4.75' },
];

// Subtotal/tax/total are fixed to the two-line default order (SPEC.md); the OneItem and
// ThreeItems stories relabel the totals row rather than pretend to recompute real math.
const totals = [
  { label: 'Subtotal', value: '$9.25', text: type(400, 15, 20), color: color.muted },
  { label: 'Tax', value: '$0.76', text: type(400, 15, 20), color: color.muted },
  { label: 'Total', value: '$10.01', text: type(700, 17, 22), color: color.ink },
];

const styles = StyleSheet.create({
  title: { ...type(700, 28, 34), color: color.ink },
  subtitle: { ...type(400, 15, 20), color: color.muted },
  card: {
    paddingHorizontal: 16,
    backgroundColor: color.surface,
    borderRadius: radius.card,
    ...insideBorder(),
  },
  divider: { width: 318, height: 1, backgroundColor: color.line, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lineName: { ...type(600, 16, 22), color: color.ink },
  lineQty: { ...type(400, 15, 20), color: color.muted },
  linePrice: { ...type(600, 15, 20), color: color.ink },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 28 },
});

export function Order({ lines = defaultLines }: { lines?: OrderLine[] }) {
  return (
    <Screen label="Order">
      <At y={56}>
        <Text style={styles.title}>Your order</Text>
      </At>
      <At y={94}>
        <Text style={styles.subtitle}>Pickup at Kettle on 5th St · ready in 8 min</Text>
      </At>
      <At y={138} style={styles.card}>
        {lines.map((item, i) => (
          <View key={item.name}>
            {i > 0 && <View style={styles.divider} />}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.lineName}>{item.name}</Text>
                <Text style={styles.lineQty}>{item.quantity}</Text>
              </View>
              <Text style={styles.linePrice}>{item.price}</Text>
            </View>
          </View>
        ))}
      </At>
      <At y={275}>
        {totals.map((t) => (
          <View key={t.label} style={styles.totalRow}>
            <Text style={[t.text, { color: t.color }]}>{t.label}</Text>
            <Text style={[t.text, { color: t.color }]}>{t.value}</Text>
          </View>
        ))}
      </At>
      <At y={694}>
        <Button variant="secondary" label="Add more" />
      </At>
      <At y={758}>
        <Button variant="primary" label="Place order" />
      </At>
    </Screen>
  );
}
