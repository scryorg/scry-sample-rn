import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  // Buttons fill their container; the stories render them at the 350px content width
  // used inside every screen — same as the web Kettle stories.
  decorators: [
    (Story) => (
      <View style={{ width: 350 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Ids match the web Kettle stories (scry-playground) exactly: components-button--primary /
// --secondary. Same args, so the render matches pixel for pixel.
export const Primary: Story = {
  args: { variant: 'primary', label: 'Add to order' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', label: 'Add more' },
};

// Extra fixtures beyond the web set (~20 stories total across the app, brief step 2):
// long labels exercise the numberOfLines={1} truncation that RN needs and CSS doesn't.
export const PrimaryLong: Story = {
  args: { variant: 'primary', label: 'Add 4 items to your order for $18.00' },
};

export const SecondaryLong: Story = {
  args: { variant: 'secondary', label: 'Add another item from the menu' },
};
