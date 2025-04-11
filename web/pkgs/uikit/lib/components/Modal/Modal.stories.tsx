import type { Meta, StoryObj } from '@storybook/react';
import Modal from './Modal';
import Button from '../Button/Button';
import Text from '../Paragraph/Paragraph';

const meta = {
  title: 'Components/Deprecated/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen', // Modal takes care of its own placement
  },
  args: {
    children: 'Default modal text',
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Modal>{args.children}</Modal>,
};

export const Centered: Story = {
  render: (args) => <Modal centered>{args.children}</Modal>,
};

export const WithContentInside: Story = {
  name: 'With content inside',
  args: {
    children: (
      <>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabit ur
          fringilla metus vitae accumsan imperdiet. Mauris enim nisl, aliquet ut
          lobortis a, fermentum id enim. In consectetur sagittis ex, sit amet
          mollis augue.
        </Text>
        <Button>OK</Button>
      </>
    ),
  },
  render: (args) => (
    <Modal>
      <Text>{args.children}</Text>
    </Modal>
  ),
};
