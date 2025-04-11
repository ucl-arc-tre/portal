import { ComponentType } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import IconButton from './IconButton';
import Icon from '../Icon/Icon';

const meta: Meta = {
  title: 'Components/Work in progress/IconButton',
  component: IconButton,
  argTypes: {
    icon: {
      control: 'select',
      options: [
        'ArrowLeft',
        'Calendar',
        'Check',
        'CheckCircle',
        'ChevronDown',
        'ChevronLeft',
        'ChevronRight',
        'ChevronUp',
        'Edit',
        'Grid',
        'HelpCircle',
        'Home',
        'Info',
        'List',
        'LogOut',
        'MapPin',
        'Menu',
        'MousePointer',
        'Plus',
        'Printer',
        'Search',
        'Settings',
        'User',
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
    icon: 'ArrowLeft',
  },
  render: (args) => {
    const IconComponent = Icon[args.icon as keyof typeof Icon] as ComponentType;
    return (
      <>
        <IconButton>
          <IconComponent />
        </IconButton>
      </>
    );
  },
};

export const Disabled: Story = {
  args: {
    icon: 'ArrowLeft',
  },
  render: (args) => {
    const IconComponent = Icon[args.icon as keyof typeof Icon] as ComponentType;
    return (
      <>
        <IconButton disabled>
          <IconComponent />
        </IconButton>
      </>
    );
  },
};
