import type { Meta, StoryObj } from '@storybook/react';

import Breadcrumbs from './Breadcrumbs';

const meta = {
  title: 'Components/Deprecated/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {
  name: 'Single breadcrumb',
  render: () => (
    <Breadcrumbs>
      <Breadcrumbs.Breadcrumb uri='/'>Home</Breadcrumbs.Breadcrumb>
    </Breadcrumbs>
  ),
};

export const Multiple: Story = {
  name: 'Multiple breadcrumbs',
  render: () => (
    <Breadcrumbs>
      <Breadcrumbs.Breadcrumb uri='/'>Home</Breadcrumbs.Breadcrumb>
      <Breadcrumbs.Breadcrumb uri='/about'>About</Breadcrumbs.Breadcrumb>
      <Breadcrumbs.Breadcrumb uri='/contact'>Contact</Breadcrumbs.Breadcrumb>
    </Breadcrumbs>
  ),
};
