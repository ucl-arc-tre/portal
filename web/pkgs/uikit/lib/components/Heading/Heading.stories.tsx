import type { Meta, StoryObj } from '@storybook/react';

import Heading from './Heading';

const meta = {
  title: 'Components/Ready to use/Heading',
  component: Heading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Heading',
  },
};

export const Level1: Story = {
  args: {
    level: 1,
    children: 'Heading level 1',
  },
};

export const Level2: Story = {
  args: {
    level: 2,
    children: 'Heading level 2',
  },
};

export const Level3: Story = {
  args: {
    title: 'Heading Level 3',
    level: 3,
    children: 'Heading level 3',
  },
};

export const Level4: Story = {
  args: {
    title: 'Heading Level 4',
    level: 4,
    children: 'Heading level 4',
  },
};

export const Margins: Story = {
  name: 'Heading with margins',
  args: {
    title: 'Heading with margins',
    margins: true,
    children: 'Heading with margins',
  },
  decorators: [
    (Story) => (
      <div>
        <div
          style={{
            height: '16px',
            backgroundColor: '#CA0007',
          }}
        />
        <Story />
        <div
          style={{
            height: '16px',
            backgroundColor: '#CA0007',
          }}
        />
      </div>
    ),
  ],
};

export const NoMargins: Story = {
  name: 'Heading without margins',
  args: {
    title: 'Heading without margins',
    margins: false,
    children: 'Heading without margins',
  },
  decorators: [
    (Story) => (
      <div>
        <div
          style={{
            height: '16px',
            backgroundColor: '#CA0007',
          }}
        />
        <Story />
        <div
          style={{
            height: '16px',
            backgroundColor: '#CA0007',
          }}
        />
      </div>
    ),
  ],
};
