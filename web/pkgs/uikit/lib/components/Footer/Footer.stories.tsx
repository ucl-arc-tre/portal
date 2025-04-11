import type { Meta, StoryObj } from '@storybook/react';

import Footer from './Footer';

const meta = {
  title: 'Components/Ready to use/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Footer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FooterWithoutNavLinks: Story = {
  name: 'Footer without links',
  render: () => {
    return <Footer />;
  },
};

export const FooterWithNavLinks: Story = {
  name: 'Footer with nav links',
  render: () => {
    return (
      <Footer>
        <Footer.Column heading='Category 1'>
          <Footer.NavLink href='#'>Item 1</Footer.NavLink>
          <Footer.NavLink href='#'>Item 2</Footer.NavLink>
          <Footer.NavLink href='#'>Item 3</Footer.NavLink>
          <Footer.NavLink href='#'>Item 4</Footer.NavLink>
        </Footer.Column>
        <Footer.Column heading='Category 2'>
          <Footer.NavLink href='#'>Item 1</Footer.NavLink>
          <Footer.NavLink href='#'>Item 2</Footer.NavLink>
          <Footer.NavLink href='#'>Item 3</Footer.NavLink>
          <Footer.NavLink href='#'>Item 4</Footer.NavLink>
        </Footer.Column>
        <Footer.Column heading='Category 3'>
          <Footer.NavLink href='#'>Item 1</Footer.NavLink>
          <Footer.NavLink href='#'>Item 2</Footer.NavLink>
          <Footer.NavLink href='#'>Item 3</Footer.NavLink>
          <Footer.NavLink href='#'>Item 4</Footer.NavLink>
        </Footer.Column>
      </Footer>
    );
  },
};
