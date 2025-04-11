import type { Meta, StoryObj } from '@storybook/react';
import UclLogo from './UclLogo';

// Need this because the `UclLogo` component will default to 0 size :(

type UclLogoPropsAndCustomArgs = React.ComponentProps<typeof UclLogo> & {
  size?: number;
};

const meta: Meta<UclLogoPropsAndCustomArgs> = {
  title: 'Components/Deprecated/UclLogo',
  component: UclLogo,
  argTypes: {
    backgroundFill: {
      control: 'color',
    },
    size: {
      name: 'CSS `height` property',
      control: {
        type: 'number',
        min: 0,
        step: 1,
      },
    },
  },
};

export default meta;

type Story = StoryObj<UclLogoPropsAndCustomArgs>;

export const Default: Story = {};

export const ManualCSS: Story = {
  args: {
    size: 56,
  },
  render: (args) => (
    <UclLogo
      {...args}
      style={{ height: args.size }}
    />
  ),
};
