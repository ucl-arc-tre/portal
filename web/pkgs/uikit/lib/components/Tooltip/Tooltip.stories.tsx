import type { Meta, StoryObj } from '@storybook/react';

import Tooltip from './Tooltip';

const meta = {
  title: 'Components/Ready to use/Tooltip',
  component: Tooltip,
  args: {
    children: 'Default tooltip text',
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
