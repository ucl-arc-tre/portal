import type { Meta, StoryObj } from '@storybook/react';

import Button from './Button';

const meta = {
  title: 'Components/Work in progress/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default button',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary button',
  },
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    children: 'Tertiary button',
  },
};

export const Destructive: Story = {
  name: 'Destructive primary',
  args: {
    destructive: true,
    children: 'Destructive button',
  },
};

export const DestructiveSecondary: Story = {
  name: 'Destructive secondary',
  args: {
    variant: 'secondary',
    destructive: true,
    children: 'Destructive secondary button',
  },
};

export const Small: Story = {
  name: 'Small primary',
  args: {
    size: 'small',
    children: 'Small button',
  },
};

export const Large: Story = {
  name: 'Large primary',
  args: {
    size: 'large',
    children: 'Large button',
  },
};

export const SmallSecondary: Story = {
  name: 'Small secondary',
  args: {
    size: 'small',
    variant: 'secondary',
    children: 'Small secondary button',
  },
};

export const LargeSecondary: Story = {
  name: 'Large secondary',
  args: {
    size: 'large',
    variant: 'secondary',
    children: 'Large secondary button',
  },
};

export const Disabled: Story = {
  name: 'Primary disabled',
  args: {
    disabled: true,
    children: 'Disabled button',
  },
};

export const DisabledSecondary: Story = {
  name: 'Secondary disabled',
  args: {
    variant: 'secondary',
    disabled: true,
    children: 'Disabled secondary button',
  },
};

export const DisabledTertiary: Story = {
  name: 'Tertiary disabled',
  args: {
    variant: 'tertiary',
    disabled: true,
    children: 'Disabled tertiary button',
  },
};
