import type { Meta, StoryObj } from '@storybook/react';
import { css } from '@emotion/css';
import Spinner from './Spinner';
import { theme } from '../../theme';

const meta = {
  title: 'Components/Ready to use/Spinner',
  component: Spinner,
  args: {
    size: 24,
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const White: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  args: {
    className: css`
      color: ${theme.color.neutral.white};
    `,
  },
};

export const Blue: Story = {
  args: {
    className: css`
      color: ${theme.color.system.blue70};
    `,
  },
};

export const Red: Story = {
  args: {
    className: css`
      color: ${theme.color.system.red70};
    `,
  },
};

export const Larger: Story = {
  args: {
    size: 48,
  },
};
