import type { Meta, StoryObj } from '@storybook/react';
import FeedbackDialog from './FeedbackDialog';

const meta = {
  title: 'Components/Work in progress/FeedbackDialog',
  component: FeedbackDialog,
  parameters: {
    docs: {
      story: 'SuccessFeedbackDialog',
    },
  },
} satisfies Meta<typeof FeedbackDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

// SuccessFeedbackDialog Story
export const SuccessFeedbackDialog: Story = {
  args: {
    open: true,
    modal: true,
    type: 'success',
    heading: 'Success',
    buttonLabel: 'Action',
    children: (
      <>
        Nunc eget consectetur nibh. Aenean lectus justo, fermentum at euismod
        sed, porta vitae libero.
      </>
    ),
  },
};

// WarningFeedbackDialog Story
export const WarningFeedbackDialog: Story = {
  args: {
    open: true,
    modal: true,
    type: 'warning',
    heading: 'Warning',
    buttonLabel: 'Action',
    children: (
      <>
        Nunc eget consectetur nibh. Aenean lectus justo, fermentum at euismod
        sed, porta vitae libero.
      </>
    ),
  },
};

// ErrorFeedbackDialog Story
export const ErrorFeedbackDialog: Story = {
  args: {
    open: true,
    modal: true,
    type: 'error',
    heading: 'Error',
    buttonLabel: 'Action',
    children: (
      <>
        Nunc eget consectetur nibh. Aenean lectus justo, fermentum at euismod
        sed, porta vitae libero.
      </>
    ),
  },
};
