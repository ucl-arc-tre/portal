import type { Meta, StoryObj } from '@storybook/react';
import Alert from './Alert';
import Link from '../Link';

const meta: Meta<typeof Alert> = {
  title: 'Components/Ready to use/Alert',
  component: Alert,
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['info', 'success', 'warning', 'error'],
    },
    testId: {
      control: 'text',
    },
  },

  decorators: [
    (Story) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const InfoAlert: Story = {
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Alert {...args}>
        <Alert.Message>This is the information alert</Alert.Message>
      </Alert>
    </div>
  ),
  args: {
    type: 'info',
  },
};

export const InfoWithMessageAndTitleAlert: Story = {
  render: (args) => (
    <Alert {...args}>
      <Alert.Title>Info Alert</Alert.Title>
      <Alert.Message>This is the information alert</Alert.Message>
    </Alert>
  ),
};

export const InfoWithMessageTitleAndLinkAlert: Story = {
  render: (args) => (
    <Alert {...args}>
      <Alert.Title>Info Alert</Alert.Title>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Alert.Message>
          This is the information alert{' '}
          <Link href='/troubleshoot'>link</Link>{' '}
        </Alert.Message>
      </div>
    </Alert>
  ),
};

export const ErrorAlert: Story = {
  render: (args) => (
    <Alert {...args}>
      <Alert.Title>Error Alert</Alert.Title>
      <Alert.Message>
        The operation was an error.{' '}
        <Link href='/troubleshoot'>Read more</Link>{' '}
      </Alert.Message>
    </Alert>
  ),
  args: {
    type: 'error',
  },
};

export const SuccessAlert: Story = {
  render: (args) => (
    <Alert {...args}>
      <Alert.Title>Success Alert</Alert.Title>
      <Alert.Message>
        The operation was successful.
        <Link href='/details'>View details</Link>
      </Alert.Message>
    </Alert>
  ),
  args: {
    type: 'success',
  },
};

export const WarningAlert: Story = {
  render: (args) => (
    <Alert {...args}>
      <Alert.Title>Warning Alert</Alert.Title>
      <Alert.Message>Proceed with caution!</Alert.Message>
    </Alert>
  ),
  args: {
    type: 'warning',
  },
};

export const CustomWidthAlert: Story = {
  render: (args) => (
    <div style={{ width: '500px' }}>
      <Alert {...args}>
        <Alert.Title>Custom Width Alert</Alert.Title>
        <Alert.Message>This alert has a custom width of 500px</Alert.Message>
      </Alert>
    </div>
  ),
};
