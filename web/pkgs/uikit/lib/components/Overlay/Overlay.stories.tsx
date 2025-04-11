import { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { css } from '@emotion/css';
import Overlay from './Overlay';

const meta = {
  title: 'Components/Utilities/Overlay',
  component: Overlay,
  parameters: {
    controls: { exclude: ['reference'] },
  },
  argTypes: {
    children: {
      control: 'text',
    },
    placement: {
      description:
        'Which side of the anchor element the Overlay appears on. https://floating-ui.com/docs/placement',
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'right',
        'right-start',
        'right-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end',
      ],
    },
    blanket: {
      description:
        'Add a blanket component behind the Overlay. https://floating-ui.com/docs/blanket',
      control: {
        type: 'boolean',
      },
    },
    flip: {
      description:
        'Changes the placement of the Overlay to the opposite side of its anchor element to keep it in view. https://floating-ui.com/docs/flip',
      control: 'boolean',
    },
    shift: {
      description:
        'Shifts the placement of the Overlay along the side of its anchor element to keep it in view. https://floating-ui.com/docs/shift',
      control: 'boolean',
    },
    offset: {
      description:
        'The distance between the Overlay and its anchor element: https://floating-ui.com/docs/offset',
      control: 'number',
    },
  },
  args: {
    children: 'Default overlay text',
    reference: undefined,
  },
  decorators: [
    (Story) => {
      const outerScrollAreaStyle = css`
        position: relative;
        width: 400px;
        height: 300px;
        overflow: scroll;
        place-items: center;
      `;

      const innerScrollAreaStyle = css`
        width: 800px;
        height: 600px;
        display: flex;
        justify-content: center;
        align-items: center;
      `;

      return (
        <>
          <div
            className={outerScrollAreaStyle}
            style={{ resize: 'both', overflow: 'auto' }}
          >
            <div className={innerScrollAreaStyle}>
              <Story />
            </div>
          </div>
        </>
      );
    },
  ],
} satisfies Meta<typeof Overlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const ref = useRef(null);

    return (
      <>
        <div ref={ref}>Anchor point</div>
        <Overlay
          reference={ref}
          placement={args.placement}
          blanket={args.blanket}
          flip={args.flip} // https://floating-ui.com/docs/flip
          shift={args.shift} // https://floating-ui.com/docs/shift
          offset={args.offset} // https://floating-ui.com/docs/offset
          // arrow={args.arrow}
        >
          {args.children}
        </Overlay>
      </>
    );
  },
};

// Implements Floating UI props
export const PlacementTop: Story = {
  name: 'Placement: top',
  args: {
    placement: 'top',
  },
  render: (args) => {
    const ref = useRef(null);

    return (
      <>
        <div ref={ref}>Anchor point</div>
        <Overlay
          reference={ref}
          placement={args.placement}
          blanket={args.blanket}
          flip={args.flip}
          shift={args.shift}
          offset={args.offset}
        >
          {args.children}
        </Overlay>
      </>
    );
  },
};

export const WithBackgroundAndBorders: Story = {
  name: '(With background & borders)',
  render: (args) => {
    const ref = useRef(null);

    const anchorPointElementStyle = css`
      padding: 2rem;
      background-color: grey;
      color: white;
      border: 5px solid black;
    `;

    const overlayStyle = css`
      padding: 0.75rem;
      background-color: grey;
      color: white;
      border: 5px solid black;
    `;

    return (
      <>
        <div
          ref={ref}
          className={anchorPointElementStyle}
        >
          Anchor point
        </div>
        <Overlay
          reference={ref}
          placement={args.placement}
          blanket={args.blanket}
          flip={args.flip}
          shift={args.shift}
          offset={args.offset}
          className={overlayStyle}
        >
          {args.children}
        </Overlay>
      </>
    );
  },
};

export const WithABlanket: Story = {
  name: 'With a blanket',
  args: {
    blanket: true,
  },
  render: (args) => {
    const ref = useRef(null);

    return (
      <>
        <div ref={ref}>Anchor point</div>
        <Overlay
          reference={ref}
          placement={args.placement}
          blanket={args.blanket}
          flip={args.flip}
          shift={args.shift}
          offset={args.offset}
          onBlanketClick={() => alert('Blanket clicked')}
        >
          {args.children}
        </Overlay>
      </>
    );
  },
};
