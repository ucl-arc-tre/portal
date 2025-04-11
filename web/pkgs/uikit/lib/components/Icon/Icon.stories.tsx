import type { Meta, StoryObj } from '@storybook/react';
import Icon from './Icon';
import { ComponentType } from 'react';

const meta: Meta = {
  title: 'Components/Work in progress/Icon',
  component: Icon,
  parameters: {
    // Appearing automatically, due to composition
    controls: { exclude: ['svg'] },
  },
  argTypes: {
    icon: {
      control: 'select',
      options: [
        'AlertTriangle',
        'ArrowLeft',
        'Avatar',
        'Calendar',
        'CheckCircle',
        'Check',
        'CheckCircle',
        'ChevronDown',
        'ChevronLeft',
        'ChevronRight',
        'ChevronUp',
        'Code',
        'Database',
        'DownloadCloud',
        'Edit',
        'Grid',
        'HardDrive',
        'HelpCircle',
        'Home',
        'Image',
        'Info',
        'Layout',
        'List',
        'Lock',
        'LogOut',
        'MapPin',
        'Menu',
        'MousePointer',
        'Plus',
        'Printer',
        'Search',
        'Settings',
        'Share2',
        'Shield',
        'Terminal',
        'Upload',
        'User',
        'XCircle',
        'XSquare',
        'X',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '(Pick an icon to view)',
  args: {
    icon: 'MapPin',
    color: 'currentColor',
  },
  render: (args) => {
    const IconComponent = Icon[args.icon as keyof typeof Icon] as ComponentType;
    return (
      <>
        <IconComponent {...args} />
      </>
    );
  },
};
