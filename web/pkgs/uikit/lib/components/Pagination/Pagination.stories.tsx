import type { Meta, StoryObj } from '@storybook/react';
import Pagination from './Pagination';

const meta = {
  title: 'Components/Work in progress/Pagination',
  component: Pagination,
  parameters: {
    docs: {
      story: 'Default',
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default Dialog Story
export const Default: Story = {
  args: {
    offset: 60,
    limit: 20,
    total: 763,
    children: (
      <>
        <Pagination.Controls />
        <Pagination.Info />
      </>
    ),
  },
};

export const FewPages: Story = {
  args: {
    offset: 20,
    limit: 20,
    total: 95,
    children: (
      <>
        <Pagination.Controls />
        <Pagination.Info />
      </>
    ),
  },
};

export const ItemsInfo: Story = {
  args: {
    offset: 60,
    limit: 20,
    total: 763,
    children: (
      <>
        <Pagination.Controls />
        <Pagination.Info
          format='items'
          itemsPluralName='files'
        />
      </>
    ),
  },
};
