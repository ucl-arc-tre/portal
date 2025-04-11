import type { Meta, StoryObj } from '@storybook/react';

import Link from './Link';

const meta = {
  title: 'Components/Work in progress/Link',
  component: Link,
  args: {
    children: 'Default link text',
    href: 'https://ucl.ac.uk',
  },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Link {...args}>{args.children}</Link>,
};

export const NewTab: Story = {
  name: 'Opens in a new tab',
  render: (args) => (
    <Link
      {...args}
      target='_blank'
    >
      {args.children}
    </Link>
  ),
};
