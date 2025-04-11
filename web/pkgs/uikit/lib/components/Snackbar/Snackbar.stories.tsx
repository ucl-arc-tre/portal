import type { Meta, StoryObj } from '@storybook/react';
import { css } from '@emotion/css';
import Snackbar from './Snackbar';

const meta = {
  title: 'Components/Ready to use/Snackbar',
  component: Snackbar,
  args: {
    children: 'Default snackbar text',
    action: undefined,
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Snackbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Close: Story = {
  name: 'Action: Close',
  args: {
    action: 'close',
    children: 'This is a snackbar with a close button',
    onClose: () => alert('Close action triggered'),
  },
};

export const Undo: Story = {
  name: 'Action: Undo',
  args: {
    action: 'undo',
    children: 'This is a snackbar with an undo button',
    onUndo: () => alert('Undo action triggered'),
  },
};

export const LongText: Story = {
  name: 'With long text',
  args: {
    children:
      'This is a snackbar with a lots of text inside it. Avoid text over 80 characters.',
  },
};

export const WithCustomPosition: Story & {
  argTypes: {
    _custom_position: {
      control: 'select';
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    };
  };
  args: {
    _custom_position: 'top-left';
  };
} = {
  name: 'With custom position',
  argTypes: {
    _custom_position: {
      control: 'select',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    },
  },
  args: {
    _custom_position: 'top-left',
    children: 'With a custom position, via `className` prop',
  },
  render: (args) => {
    const { _custom_position } = args as typeof args & {
      _custom_position: string;
    };

    const positionStyle = css`
      position: fixed;
      ${_custom_position === 'top-left' && 'top: 24px; left: 24px;'}
      ${_custom_position === 'top-right' && 'top: 24px; right: 24px;'}
      ${_custom_position === 'bottom-left' && 'bottom: 24px; left: 24px;'}
      ${_custom_position === 'bottom-right' && 'bottom: 24px; right: 24px;'}
    `;

    return (
      <Snackbar
        {...args}
        className={positionStyle}
      >
        {args.children}
      </Snackbar>
    );
  },
};
