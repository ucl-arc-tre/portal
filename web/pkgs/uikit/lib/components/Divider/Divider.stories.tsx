import type { Meta, StoryObj } from '@storybook/react';

import Divider from './Divider';

const meta = {
  title: 'Components/Ready to use/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default Divider',
  render: () => (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Divider />
    </div>
  ),
};
