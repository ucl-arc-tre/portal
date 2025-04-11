import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import Datepicker from './Datepicker';

const meta = {
  title: 'Components/Work in progress/Datepicker/Datepicker',
  component: Datepicker,
  parameters: { layout: 'padded' },
  argTypes: {
    date: { control: { type: 'date' } },
    minDate: { control: { type: 'date' } },
    maxDate: { control: { type: 'date' } },
    native: { control: { type: 'boolean' } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Datepicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    date: null,
    onDateChange: () => {},
  },
  render: () => {
    const [args, updateArgs] = useArgs();

    // Convert UNIX timestamp from Storybook controls to `Date` object
    // https://storybook.js.org/docs/essentials/controls#annotation
    args.date = args.date ? new Date(args.date) : null;
    args.minDate = args.minDate ? new Date(args.minDate) : null;
    args.maxDate = args.maxDate ? new Date(args.maxDate) : null;

    // const onChange = (event: React.ChangeEvent<HTMLInputElement>) => updateArgs({ date: event.target.valueAsDate });
    const onDateChange = (date: Date | null | undefined) =>
      updateArgs({ date: date });
    return (
      <Datepicker
        {...args}
        date={args.date}
        onDateChange={onDateChange}
      />
    );
  },
};

export const AsNative: Story = {
  name: 'As native fallback',
  args: {
    native: true,
    date: null,
    onDateChange: () => {},
  },
  render: () => {
    const [args, updateArgs] = useArgs();
    args.date = args.date ? new Date(args.date) : null;
    args.minDate = args.minDate ? new Date(args.minDate) : null;
    args.maxDate = args.maxDate ? new Date(args.maxDate) : null;
    const onDateChange = (date: Date | null | undefined) =>
      updateArgs({ date: date });
    return (
      <Datepicker
        {...args}
        date={args.date}
        onDateChange={onDateChange}
      />
    );
  },
};
