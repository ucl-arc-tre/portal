import type { Meta, StoryObj } from '@storybook/react';
import Avatar from './Avatar';
import sampleAvatarPhoto from '../../../public/sample-avatar-photo.jpg';

const meta = {
  title: 'Components/Ready to use/Avatar',
  component: Avatar,
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Image: Story = {
  args: {
    variant: 'image',
    imageUrl: sampleAvatarPhoto,
  },
};

export const Initials: Story = {
  args: {
    variant: 'initials',
    name: 'Beverley Haggis',
  },
};

export const Icon: Story = {
  args: {
    variant: 'icon',
  },
};
