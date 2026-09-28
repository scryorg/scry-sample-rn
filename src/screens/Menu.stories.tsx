import type { Meta, StoryObj } from '@storybook/react-native';
import { menuItems } from '../data';
import { Menu } from './Menu';

const meta = {
  title: 'Screens/Menu',
  component: Menu,
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

// Id matches the web Kettle story exactly: screens-menu--default.
export const Default: Story = {};

// A shorter menu (2 of the 4 items), same layout — coverage for a menu with fewer rows.
export const TwoItems: Story = {
  args: { items: menuItems.slice(0, 2) },
};
