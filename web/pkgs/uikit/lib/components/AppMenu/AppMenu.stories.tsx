import type { Meta, StoryObj } from '@storybook/react';
import { Link as InternalLink } from 'wouter';
import AppMenu from './AppMenu';
import Icon from '../Icon/Icon';
import Link from '../Link/Link';

const meta = {
  title: 'Components/Deprecated/AppMenu',
  component: AppMenu,
} satisfies Meta<typeof AppMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  render: () => {
    return (
      <AppMenu>
        <AppMenu.MenuItem>Menu item 01</AppMenu.MenuItem>
        <AppMenu.MenuItem>Menu item 02</AppMenu.MenuItem>
        <AppMenu.MenuItem>Menu item 03</AppMenu.MenuItem>
      </AppMenu>
    );
  },
};

export const WithDividers: Story = {
  name: 'With dividers',
  render: () => {
    return (
      <AppMenu>
        <AppMenu.MenuItem>Menu item 01</AppMenu.MenuItem>
        <AppMenu.Divider />
        <AppMenu.MenuItem>Menu item 02</AppMenu.MenuItem>
        <AppMenu.Divider />
        <AppMenu.MenuItem>Menu item 03</AppMenu.MenuItem>
      </AppMenu>
    );
  },
};

export const WithIcons: Story = {
  name: 'With icons',
  render: () => {
    return (
      <AppMenu>
        <AppMenu.MenuItem icon={<Icon.Calendar size={20} />}>
          Calendar
        </AppMenu.MenuItem>
        <AppMenu.MenuItem icon={<Icon.Edit size={20} />}>Edit</AppMenu.MenuItem>
        <AppMenu.MenuItem icon={<Icon.Grid size={20} />}>Apps</AppMenu.MenuItem>
        <AppMenu.MenuItem icon={<Icon.Settings size={20} />}>
          Settings
        </AppMenu.MenuItem>
      </AppMenu>
    );
  },
};

export const WithTrigger: Story = {
  name: 'With trigger',
  render: () => {
    return (
      <AppMenu>
        <AppMenu.Trigger>
          <Icon.Menu />
        </AppMenu.Trigger>
        <AppMenu.Content>
          <AppMenu.MenuItem>Menu item 01</AppMenu.MenuItem>
          <AppMenu.MenuItem>Menu item 02</AppMenu.MenuItem>
          <AppMenu.MenuItem>Menu item 03</AppMenu.MenuItem>
        </AppMenu.Content>
      </AppMenu>
    );
  },
};

export const Complex: Story = {
  render: () => (
    <AppMenu>
      <AppMenu.MenuItem icon={<Icon.Calendar size={20} />}>
        <InternalLink
          to='/timetable/personal'
          asChild
        >
          <Link noVisited>Personal Timetable</Link>
        </InternalLink>
      </AppMenu.MenuItem>
      <AppMenu.MenuItem icon={<Icon.Calendar size={20} />}>
        <InternalLink
          to='/timetable/degree'
          asChild
        >
          <Link noVisited>Degree Timetable</Link>
        </InternalLink>
      </AppMenu.MenuItem>
      <AppMenu.MenuItem icon={<Icon.Calendar size={20} />}>
        <InternalLink
          to='/timetable/custom'
          asChild
        >
          <Link noVisited>Custom Timetable</Link>
        </InternalLink>
      </AppMenu.MenuItem>
      <AppMenu.Divider />
      <AppMenu.MenuItem icon={<Icon.Settings size={20} />}>
        Settings
      </AppMenu.MenuItem>
      <AppMenu.MenuItem icon={<Icon.HelpCircle size={20} />}>
        Help
      </AppMenu.MenuItem>
      <AppMenu.Divider />
      <AppMenu.MenuItem icon={<Icon.ArrowLeft size={20} />}>
        <InternalLink
          to='/timetable/home'
          asChild
        >
          <Link noVisited>Exit beta</Link>
        </InternalLink>
      </AppMenu.MenuItem>
    </AppMenu>
  ),
};

export const ComplexWithTrigger: Story = {
  name: 'Complex with trigger',
  render: () => (
    <AppMenu>
      <AppMenu.Trigger>
        <Icon.Menu />
      </AppMenu.Trigger>
      <AppMenu.Content>
        <AppMenu.MenuItem icon={<Icon.Calendar size={20} />}>
          <InternalLink
            to='/timetable/personal'
            asChild
          >
            <Link noVisited>Personal Timetable</Link>
          </InternalLink>
        </AppMenu.MenuItem>
        <AppMenu.MenuItem icon={<Icon.Calendar size={20} />}>
          <InternalLink
            to='/timetable/degree'
            asChild
          >
            <Link noVisited>Degree Timetable</Link>
          </InternalLink>
        </AppMenu.MenuItem>
        <AppMenu.MenuItem icon={<Icon.Calendar size={20} />}>
          <InternalLink
            to='/timetable/custom'
            asChild
          >
            <Link noVisited>Custom Timetable</Link>
          </InternalLink>
        </AppMenu.MenuItem>
        <AppMenu.Divider />
        <AppMenu.MenuItem icon={<Icon.Settings size={20} />}>
          Settings
        </AppMenu.MenuItem>
        <AppMenu.MenuItem icon={<Icon.HelpCircle size={20} />}>
          Help
        </AppMenu.MenuItem>
        <AppMenu.Divider />
        <AppMenu.MenuItem icon={<Icon.ArrowLeft size={20} />}>
          <InternalLink
            to='/timetable/home'
            asChild
          >
            <Link noVisited>Exit beta</Link>
          </InternalLink>
        </AppMenu.MenuItem>
      </AppMenu.Content>
    </AppMenu>
  ),
};
