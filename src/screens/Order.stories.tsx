import type { Meta, StoryObj } from '@storybook/react-native';
import { Order } from './Order';

const meta = {
  title: 'Screens/Order',
  component: Order,
} satisfies Meta<typeof Order>;

export default meta;
type Story = StoryObj<typeof meta>;

// Id matches the web Kettle story exactly: screens-order--default (two lines, SPEC.md totals).
export const Default: Story = {};

export const OneItem: Story = {
  args: { lines: [{ name: 'Flat White', quantity: '×1', price: '$4.50' }] },
};

export const ThreeItems: Story = {
  args: {
    lines: [
      { name: 'Flat White', quantity: '×1', price: '$4.50' },
      { name: 'Cold Brew', quantity: '×1', price: '$4.75' },
      { name: 'Matcha Latte', quantity: '×1', price: '$5.25' },
    ],
  },
};
