import type { Meta, StoryObj } from '@storybook/react';

import Select from './Select';

const meta = {
  title: 'Components/Work in progress/Select',
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <option value='1'>Option 1</option>
      <option value='2'>Option 2</option>
      <option value='3'>Option 3</option>
    </Select>
  ),
};

export const NoOptions: Story = {
  name: 'No options',
  render: () => <Select />,
};
