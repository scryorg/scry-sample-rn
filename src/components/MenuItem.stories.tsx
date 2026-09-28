import type { Meta, StoryObj } from '@storybook/react-native';
import { menuItems } from '../data';
import { MenuItem } from './MenuItem';

const meta = {
  title: 'Components/MenuItem',
  component: MenuItem,
} satisfies Meta<typeof MenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const [flatWhite, coldBrew, matchaLatte, cortado] = menuItems;

// Id matches the web Kettle story exactly: components-menuitem--default. Same args (the
// MenuItem prop is itemName, not name — see the note on the web story).
export const Default: Story = { args: flatWhite };

// The other three menu rows, straight from SPEC.md's Menu screen list.
export const ColdBrew: Story = { args: coldBrew };
export const MatchaLatte: Story = { args: matchaLatte };
export const Cortado: Story = { args: cortado };

// Truncation fixture: RN needs numberOfLines={1} where CSS gets nowrap/ellipsis for free.
export const LongName: Story = {
  args: {
    itemName: 'Triple Ristretto Flat White, Extra Hot',
    description: 'A very long description that should truncate to a single line, not wrap',
    price: '$6.25',
    tileColor: flatWhite.tileColor,
  },
};
