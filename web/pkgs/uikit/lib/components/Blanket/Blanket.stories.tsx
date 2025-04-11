import { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Blanket from './Blanket';

const meta = {
  title: 'Components/Ready to use/Blanket',
  component: Blanket,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Blanket>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return <Blanket {...args} />;
  },
};

export const AlertOnClick: Story = {
  name: 'Trigger alert on click',
  args: {
    onClick: () => alert('You clicked the Blanket!'),
  },
  render: (args) => {
    return <Blanket {...args} />;
  },
};

export const InFrontOfElement: Story = {
  name: 'In front of an element',
  render: (args) => {
    const anotherElementStyle: CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1,
      backgroundColor: 'grey',
      padding: '2rem',
      fontSize: '1.5rem',
    };
    return (
      <>
        <div style={anotherElementStyle}>Another element</div>
        <Blanket {...args} />
      </>
    );
  },
};

export const WithColour: Story = {
  name: 'With a colour',
  render: (args) => {
    const style = {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    };
    return (
      <Blanket
        {...args}
        style={style}
      />
    );
  },
};
