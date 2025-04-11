import type { Meta, StoryObj } from '@storybook/react';
import Day from './Day';

const meta = {
  title: 'Components/Work in progress/Datepicker/Day',
  component: Day,
} satisfies Meta<typeof Day>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    date: new Date(),
  },
  render: (args) => {
    args.date = args.date ? new Date(args.date) : null;
    return <Day {...args} />;
  },
};

export const Selected: Story = {
  args: {
    date: new Date(),
    isSelected: true,
  },
  render: (args) => {
    args.date = args.date ? new Date(args.date) : null;
    return <Day {...args} />;
  },
};

export const Today: Story = {
  args: {
    date: new Date(),
    isToday: true,
  },
  render: (args) => {
    args.date = args.date ? new Date(args.date) : null;
    return <Day {...args} />;
  },
};

export const Disabled: Story = {
  args: {
    date: new Date(),
    isDisabled: true,
  },
  render: (args) => {
    args.date = args.date ? new Date(args.date) : null;
    return <Day {...args} />;
  },
};

export const NotInCurrentMonth: Story = {
  args: {
    date: new Date(),
    isInCurrentMonth: false,
  },
  render: (args) => {
    args.date = args.date ? new Date(args.date) : null;
    return <Day {...args} />;
  },
};

export const AlertOnPick: Story = {
  name: '(Trigger alert on pick)',
  args: {
    date: new Date(),
  },
  render: (args) => {
    args.date = args.date ? new Date(args.date) : null;
    const onPick = (date: Date) => alert(`Picked date: ${date.toDateString()}`);
    return (
      <Day
        {...args}
        onPick={onPick}
      />
    );
  },
};
