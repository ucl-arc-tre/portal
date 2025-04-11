import type { Meta, StoryObj } from '@storybook/react';
import { css } from '@emotion/css';

import AppHeader from './AppHeader';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import AppMenu from '../AppMenu/AppMenu';
import Icon from '../Icon/Icon';
import { useTheme } from '../../theme';

const meta = {
  title: 'Components/Deprecated/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithBreadcrumbs: Story = {
  name: 'With breadcrumbs',

  render: () => {
    const [theme] = useTheme();

    // This ought to be done in`<Breadcrumb>`or in `<AppHeader.Bottom>`!
    const invertedTextStyle = css`
      color: ${theme.color.text.inverted};
    `;

    return (
      <AppHeader className={invertedTextStyle}>
        <AppHeader.Top />
        <AppHeader.Bottom>
          <Breadcrumbs>
            <Breadcrumbs.Breadcrumb uri='/'>Home</Breadcrumbs.Breadcrumb>
          </Breadcrumbs>
        </AppHeader.Bottom>
      </AppHeader>
    );
  },
};

export const WithoutBreadcrumbs: Story = {
  name: 'Without breadcrumbs',
  render: () => {
    return (
      <AppHeader>
        <AppHeader.Top />
        <AppHeader.Bottom />
      </AppHeader>
    );
  },
};

export const WithMultipleBreadcrumbs: Story = {
  name: 'With multiple breadcrumbs',
  render: () => {
    const [theme] = useTheme();
    const invertedTextStyle = css`
      color: ${theme.color.text.inverted};
    `;
    return (
      <AppHeader>
        <AppHeader.Top />
        <AppHeader.Bottom className={invertedTextStyle}>
          <Breadcrumbs>
            <Breadcrumbs.Breadcrumb uri='/'>Home</Breadcrumbs.Breadcrumb>
            <Breadcrumbs.Breadcrumb uri='/showcase'>
              Component Library
            </Breadcrumbs.Breadcrumb>
            <Breadcrumbs.Breadcrumb uri='/showcase/app-header'>
              App Header
            </Breadcrumbs.Breadcrumb>
          </Breadcrumbs>
        </AppHeader.Bottom>
      </AppHeader>
    );
  },
};

export const WithAppMenu: Story = {
  name: 'With AppMenu',
  render: () => {
    const [theme] = useTheme();

    const centerVerticalStyle = css`
      display: flex;
      align-items: center;
    `;

    const invertedTextStyle = css`
      color: ${theme.color.text.inverted};
    `;

    return (
      <AppHeader>
        <AppHeader.Top className={centerVerticalStyle}>
          <AppMenu>
            <AppMenu.Trigger>
              <Icon.Menu />
            </AppMenu.Trigger>
            <AppMenu.Content>
              <AppMenu.MenuItem icon={<Icon.Calendar size={20} />}>
                Item 1
              </AppMenu.MenuItem>
              <AppMenu.MenuItem icon={<Icon.Calendar size={20} />}>
                Item 2
              </AppMenu.MenuItem>
              <AppMenu.MenuItem icon={<Icon.Calendar size={20} />}>
                Item 3
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
                Log out
              </AppMenu.MenuItem>
            </AppMenu.Content>
          </AppMenu>
        </AppHeader.Top>
        <AppHeader.Bottom className={invertedTextStyle}>
          <Breadcrumbs.Breadcrumb uri='/'>Home</Breadcrumbs.Breadcrumb>
        </AppHeader.Bottom>
      </AppHeader>
    );
  },
};
