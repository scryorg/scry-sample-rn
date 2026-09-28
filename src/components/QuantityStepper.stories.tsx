import type { Meta, StoryObj } from '@storybook/react-native';
import { QuantityStepper } from './QuantityStepper';

const meta = {
  title: 'Components/QuantityStepper',
  component: QuantityStepper,
} satisfies Meta<typeof QuantityStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

// Id matches the web Kettle story exactly: components-quantitystepper--default.
export const Default: Story = { args: { count: 1 } };

// Boundary states: the count cell is a fixed 40px column, so 0 and a double digit are the
// fixture's coverage for the diff adapter (single glyph vs two).
export const Zero: Story = { args: { count: 0 } };
export const DoubleDigit: Story = { args: { count: 12 } };
