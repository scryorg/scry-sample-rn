// The four Kettle menu items, straight from SPEC.md. Shared by the Menu screen, the
// MenuItem stories and the Item Detail stories so the numbers never drift.
import { color } from './tokens';

export interface MenuItemData {
  itemName: string;
  description: string;
  price: string;
  tileColor: string;
}

export const menuItems: MenuItemData[] = [
  { itemName: 'Flat White', description: 'Double ristretto, silky milk', price: '$4.50', tileColor: color.tileFlatWhite },
  { itemName: 'Cold Brew', description: 'Steeped 18 hours, over ice', price: '$4.75', tileColor: color.tileColdBrew },
  { itemName: 'Matcha Latte', description: 'Ceremonial grade, oat milk', price: '$5.25', tileColor: color.tileMatcha },
  { itemName: 'Cortado', description: 'Equal parts espresso and milk', price: '$4.00', tileColor: color.tileCortado },
];

/** Two-line detail copy per item, the Item Detail screen's y=404 block. SPEC.md gives the
 * exact two lines for Flat White; the other three follow the same shape (double ristretto ->
 * one shot, same steamed-milk pour) so the layout stays identical across every capture. */
export const itemDetailCopy: Record<string, [string, string]> = {
  'Flat White': ['A double ristretto with steamed whole milk,', 'poured thin so the coffee still leads.'],
  'Cold Brew': ['Coarse-ground and steeped in cold water', 'for 18 hours, then served straight over ice.'],
  'Matcha Latte': ['Ceremonial-grade matcha whisked smooth,', 'poured over oat milk, lightly sweetened.'],
  Cortado: ['Equal parts espresso and steamed milk,', 'cut just enough to soften the shot.'],
};
