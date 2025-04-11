import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';

import Toggle from './Toggle';

const meta = {
  title: 'Components/Work in progress/Toggle',
  component: Toggle,
  argTypes: {
    checked: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
  },
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [args, updateArgs] = useArgs();

    const onClick = () => updateArgs({ checked: !args.checked });

    return (
      <Toggle
        {...args}
        onClick={onClick}
      />
    );
  },
};
