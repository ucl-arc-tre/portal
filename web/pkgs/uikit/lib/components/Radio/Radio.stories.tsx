import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import Radio from './Radio';

const meta = {
  title: 'Components/Work in progress/Radio',
  component: Radio,
  argTypes: {
    checked: { control: { type: 'boolean' } },
    // defaultChecked: { control: { type: 'boolean' } },  // This doesn't work properly in the component as of 05/10/2024
    disabled: { control: { type: 'boolean' } },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [args, updateArgs] = useArgs();
    const onChange = () => updateArgs({ checked: !args.checked });
    return (
      <Radio
        {...args}
        onChange={onChange}
      />
    );
  },
};
