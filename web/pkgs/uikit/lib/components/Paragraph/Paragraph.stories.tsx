import type { Meta, StoryObj } from '@storybook/react';
import Paragraph from './Paragraph';
import { Link } from '../';

const meta = {
  title: 'Components/Ready to use/Paragraph',
  component: Paragraph,
  args: {
    children: 'Default paragraph text',
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Paragraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMargins: Story = {
  name: 'With margins',
  args: {
    margins: true,
    children: 'This is a paragraph with margins.',
  },
  decorators: [
    (Story) => (
      <>
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
      </>
    ),
  ],
};

export const WithoutMargins: Story = {
  name: 'Without margins',
  args: {
    margins: false,
    children: 'This is a paragraph without margins.',
  },
  decorators: [
    (Story) => (
      <>
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
      </>
    ),
  ],
};

export const WithRichText: Story = {
  name: 'With rich text children',
  parameters: {
    controls: { exclude: ['children'] },
  },
  args: {
    children: (
      <>
        <strong>This text is bold,</strong> <em>and this text is italicised</em>
        . <u>This text is underlined.</u>{' '}
        <Link
          href='https://www.ucl.ac.uk/'
          target='_blank'
        >
          Visit UCL's website
        </Link>
      </>
    ),
  },
};

export const WithLongText: Story = {
  name: 'With long text',
  parameters: {
    controls: { exclude: ['children'] },
  },
  args: {
    children: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
  },
};

export const MultipleParagraphs: Story = {
  name: 'Multiple paragraphs',
  parameters: {
    controls: { exclude: ['children'] },
  },
  render: (args) => (
    <>
      <Paragraph {...args}>
        This is the first paragraph. The text continues for a bit longer to
        demonstrate the paragraph's styling.
      </Paragraph>
      <Paragraph {...args}>
        This is the second paragraph. This text also continues for a bit longer
        to show the paragraph's styling.
      </Paragraph>
      <Paragraph {...args}>
        This is the third paragraph. UCL is a great university, and this text
        continues for a bit longer to demonstrate the paragraph's styling.
      </Paragraph>
    </>
  ),
};
