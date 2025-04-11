import type { Meta, StoryObj } from '@storybook/react';
import Dialog from './Dialog';

const meta = {
  title: 'Components/Work in progress/Dialog',
  component: Dialog,
  parameters: {
    docs: {
      story: 'Default',
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default Dialog Story
export const DefaultDialog: Story = {
  args: {
    open: true,
    modal: true,
    children: (
      <>
        <Dialog.Header>Dialog</Dialog.Header>
        <Dialog.Body>
          <p>
            Donec fringilla tellus sed varius posuere. Vivamus sagittis
            scelerisque eros ut ornare.{' '}
          </p>
        </Dialog.Body>
        <Dialog.Footer primaryButton='Confirm' />
      </>
    ),
  },
};

// Both Buttons Dialog Story
export const BothButtonsDialog: Story = {
  args: {
    open: true,
    modal: true,
    children: (
      <>
        <Dialog.Header>Dialog</Dialog.Header>
        <Dialog.Body>
          <p>
            Donec fringilla tellus sed varius posuere. Vivamus sagittis
            scelerisque eros ut ornare.{' '}
          </p>
        </Dialog.Body>
        <Dialog.Footer
          primaryButton='Confirm'
          secondaryButton='Back'
        />
      </>
    ),
  },
};

// Secondary Button Dialog Story
export const SecondaryButtonDialog: Story = {
  args: {
    open: true,
    modal: true,
    children: (
      <>
        <Dialog.Header>Dialog</Dialog.Header>
        <Dialog.Body>
          <p>
            Donec fringilla tellus sed varius posuere. Vivamus sagittis
            scelerisque eros ut ornare.{' '}
          </p>
        </Dialog.Body>
        <Dialog.Footer secondaryButton='Back' />
      </>
    ),
  },
};

// Alternative Buttons Dialog Story
export const AlternativeButtonsDialog: Story = {
  args: {
    open: true,
    modal: true,
    children: (
      <>
        <Dialog.Header>Dialog</Dialog.Header>
        <Dialog.Body>
          <p>
            Donec fringilla tellus sed varius posuere. Vivamus sagittis
            scelerisque eros ut ornare.{' '}
          </p>
        </Dialog.Body>
        <Dialog.Footer
          primaryButton='Confirm'
          secondaryButton='Back'
          primaryButtonProps={{
            variant: 'secondary',
          }}
          secondaryButtonProps={{
            variant: 'tertiary',
          }}
        />
      </>
    ),
  },
};
