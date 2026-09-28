import type { Meta, StoryObj } from '@storybook/react-native';
import { ItemDetail } from './ItemDetail';

const meta = {
  title: 'Screens/Item Detail',
  component: ItemDetail,
} satisfies Meta<typeof ItemDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

// Id matches the web Kettle story exactly: screens-item-detail--default (Flat White).
export const Default: Story = {};

// The other three menu items through the same layout.
export const ColdBrew: Story = { args: { itemName: 'Cold Brew' } };
export const MatchaLatte: Story = { args: { itemName: 'Matcha Latte' } };
export const Cortado: Story = { args: { itemName: 'Cortado' } };
