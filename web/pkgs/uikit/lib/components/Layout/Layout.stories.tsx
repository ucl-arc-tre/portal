import type { Meta, StoryObj } from '@storybook/react';
import { css } from '@emotion/css';
import { useTheme } from '../../theme';
import Layout from './Layout';
import { Heading, Button, Text } from '../';

const meta = {
  title: 'Components/Utilities/Layout',
  component: Layout,
  parameters: { layout: 'fulscreen' },
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // Just an empty `<div>` with a grid layout -- expected behaviour
  render: () => <Layout />,
};

export const ThreeColumns: Story = {
  name: 'Three column layout',
  render: () => {
    const [theme] = useTheme();

    const sectionStyle = css`
      grid-column: span 4;
      height: 100%;
      background-color: ${theme.color.display.blueMuted};
    `;

    const numberMarkerStyle = css`
      display: flex;
      justify-content: center;
      align-items: center;
      height: 8rem;
      font-size: ${theme.font.size.f20};
      font-weight: ${theme.font.weight.semiBold};
      color: ${theme.color.text.primary};
      font-family: ${theme.font.family.fixed};
      font-size: ${theme.font.size.f20};
    `;

    return (
      <Layout>
        <section className={sectionStyle}>
          <div className={numberMarkerStyle}>#1</div>
        </section>
        <section className={sectionStyle}>
          <div className={numberMarkerStyle}>#2</div>
        </section>
        <section className={sectionStyle}>
          <div className={numberMarkerStyle}>#3</div>
        </section>
      </Layout>
    );
  },
};

export const FourColumns: Story = {
  name: 'Four column layout',
  render: () => {
    const [theme] = useTheme();

    const sectionStyle = css`
      grid-column: span 4;
      height: 100%;
      background-color: ${theme.color.display.pinkMuted};

      ${theme.mq.mobile} {
        grid-column: span 2;
      }

      ${theme.mq.desktop} {
        grid-column: span 3;
      }
    `;

    const numberMarkerStyle = css`
      display: flex;
      justify-content: center;
      align-items: center;
      height: 8rem;
      font-size: ${theme.font.size.f20};
      font-weight: ${theme.font.weight.semiBold};
      color: ${theme.color.text.primary};
      font-family: ${theme.font.family.fixed};
      font-size: ${theme.font.size.f20};
    `;

    return (
      <Layout>
        <section className={sectionStyle}>
          <div className={numberMarkerStyle}>#1</div>
        </section>
        <section className={sectionStyle}>
          <div className={numberMarkerStyle}>#2</div>
        </section>
        <section className={sectionStyle}>
          <div className={numberMarkerStyle}>#3</div>
        </section>
        <section className={sectionStyle}>
          <div className={numberMarkerStyle}>#4</div>
        </section>
      </Layout>
    );
  },
};

export const GenericScreen: Story = {
  name: 'Generic screen',
  render: () => {
    const [theme] = useTheme();

    const mainHeaderStyle = css`
      grid-column: 1 / -1;
    `;

    const firstSectionStyle = css`
      grid-column: span 4;

      ${theme.mq.mobile} {
        grid-column: span 3;
      }
    `;

    const buttonGroupStyle = css`
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    const secondSectionStyle = css`
      grid-column: span 4;

      ${theme.mq.tablet} {
        grid-column: span 5;
      }

      ${theme.mq.desktop} {
        grid-column: 5 / -2;
      }
    `;

    const thirdSectionStyle = css`
      grid-column: 1 / -1;

      ${theme.mq.desktop} {
        grid-column: 2 / -2;
      }

      ${theme.mq.desktopLarge} {
        grid-column: 3 / -3;
      }
    `;

    const colourBlockStyle = css`
      background-color: ${theme.color.display.yellowVibrant};
      height: 250px;
    `;

    return (
      <Layout>
        <header className={mainHeaderStyle}>
          <Heading>UCL App</Heading>
        </header>

        <section className={firstSectionStyle}>
          <Heading level={2}>Some buttons</Heading>
          <div className={buttonGroupStyle}>
            <Button>Button 1</Button>
            <Button variant='secondary'>Button 2</Button>
          </div>
        </section>

        <section className={secondSectionStyle}>
          <Heading level={2}>Our story</Heading>
          <Text>
            UCL was founded on 11 February 1826 as an alternative to the
            Anglican universities of Oxford and Cambridge. It took the form of a
            joint stock company, with shares sold for £100 (equivalent to
            £10,600 in 2023) to proprietors, under the name of London
            University, although without legal recognition as a university or
            the associated right to award degrees. London University's first
            warden was Leonard Horner, who was the first scientist to head a
            British university.
          </Text>
        </section>

        <section className={thirdSectionStyle}>
          <Heading level={2}>A big wide block of colour </Heading>
          <div className={colourBlockStyle} />
        </section>
      </Layout>
    );
  },
};

export const CreativeGrid: Story = {
  name: 'Creative grid layout',
  render: () => {
    const [theme] = useTheme();

    const gridContainerStyle = css`
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-bottom: 48px;

      ${theme.mq.mobile} {
        grid-template-columns: repeat(12, 1fr);
        grid-template-rows: repeat(6, minmax(80px, auto));
      }

      ${theme.mq.desktopLarge} {
        grid-template-columns: repeat(16, 1fr);
        grid-template-rows: repeat(8, minmax(90px, auto));
        gap: 24px;
      }
    `;

    const gridItemBaseStyle = css`
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: ${theme.font.weight.bold};
      color: white;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      height: 120px;
      min-height: 100px;
      font-family: ${theme.font.family.fixed};
      font-size: ${theme.font.size.f20};
    `;

    const block1Style = css`
      ${gridItemBaseStyle}
      background-color: ${theme.color.display.purpleVibrant};

      ${theme.mq.mobile} {
        grid-column: 1 / 8;
        grid-row: 1 / 3;
        height: auto;
      }

      ${theme.mq.tablet} {
        grid-column: 1 / 7;
        grid-row: 1 / 4;
      }

      ${theme.mq.desktop} {
        grid-column: 1 / 6;
        grid-row: 1 / 3;
      }

      ${theme.mq.desktopLarge} {
        grid-column: 2 / 6;
        grid-row: 2 / 4;
        border-radius: 50%;
        transform: rotate(-5deg);
      }
    `;

    const block2Style = css`
      ${gridItemBaseStyle}
      background-color: ${theme.color.display.blueVibrant};

      ${theme.mq.mobile} {
        grid-column: 8 / 13;
        grid-row: 1;
        height: auto;
      }

      ${theme.mq.tablet} {
        grid-column: 7 / 13;
        grid-row: 1 / 2;
      }

      ${theme.mq.desktop} {
        grid-column: 6 / 10;
        grid-row: 1;
      }

      ${theme.mq.desktopLarge} {
        grid-column: 7 / 11;
        grid-row: 1 / 3;
        border-radius: 8px 8px 50% 50%;
      }
    `;

    const block3Style = css`
      ${gridItemBaseStyle}
      background-color: ${theme.color.display.greenVibrant};

      ${theme.mq.mobile} {
        grid-column: 8 / 13;
        grid-row: 2 / 4;
        height: auto;
      }

      ${theme.mq.tablet} {
        grid-column: 7 / 10;
        grid-row: 2 / 4;
      }

      ${theme.mq.desktop} {
        grid-column: 10 / 13;
        grid-row: 1 / 4;
      }

      ${theme.mq.desktopLarge} {
        grid-column: 12 / 16;
        grid-row: 2 / 5;
        border-radius: 16px;
        transform: rotate(3deg);
      }
    `;

    const block4Style = css`
      ${gridItemBaseStyle}
      background-color: ${theme.color.display.blueMuted};

      ${theme.mq.mobile} {
        grid-column: 1 / 8;
        grid-row: 3 / 5;
        height: auto;
      }

      ${theme.mq.tablet} {
        grid-column: 10 / 13;
        grid-row: 2 / 5;
      }

      ${theme.mq.desktop} {
        grid-column: 6 / 10;
        grid-row: 2 / 4;
      }

      ${theme.mq.desktopLarge} {
        grid-column: 7 / 11;
        grid-row: 4 / 6;
        clip-path: polygon(0% 0%, 100% 20%, 100% 100%, 0% 80%);
      }
    `;

    const block5Style = css`
      ${gridItemBaseStyle}
      background-color: ${theme.color.display.yellowVibrant};

      ${theme.mq.mobile} {
        grid-column: 1 / 8;
        grid-row: 5 / 7;
        height: auto;
      }

      ${theme.mq.tablet} {
        grid-column: 1 / 7;
        grid-row: 4 / 6;
      }

      ${theme.mq.desktop} {
        grid-column: 1 / 6;
        grid-row: 3 / 5;
      }

      ${theme.mq.desktopLarge} {
        grid-column: 3 / 6;
        grid-row: 5 / 8;
        border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
      }
    `;

    const block6Style = css`
      ${gridItemBaseStyle}
      background-color: ${theme.color.display.pinkVibrant};

      ${theme.mq.mobile} {
        grid-column: 8 / 13;
        grid-row: 4 / 7;
        height: auto;
      }

      ${theme.mq.tablet} {
        grid-column: 7 / 13;
        grid-row: 5 / 7;
      }

      ${theme.mq.desktop} {
        grid-column: 6 / 13;
        grid-row: 4 / 6;
      }

      ${theme.mq.desktopLarge} {
        grid-column: 12 / 15;
        grid-row: 6 / 9;
        clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
      }
    `;

    const block7Style = css`
      ${gridItemBaseStyle}
      background-color: ${theme.color.display.blueVibrant};

      ${theme.mq.mobile} {
        grid-column: 1 / 13;
        grid-row: 7;
        height: auto;
      }

      ${theme.mq.tablet} {
        grid-column: 1 / 13;
        grid-row: 7 / 8;
      }

      ${theme.mq.desktop} {
        grid-column: 1 / 6;
        grid-row: 5 / 7;
      }

      ${theme.mq.desktopLarge} {
        grid-column: 7 / 10;
        grid-row: 7 / 9;
        border-radius: 0 50% 50% 50%;
        transform: rotate(10deg);
      }
    `;

    const headerStyle = css`
      grid-column: 1 / -1;
      text-align: center;
      margin-bottom: 32px;

      ${theme.mq.desktopLarge} {
        margin-bottom: 48px;
      }
    `;

    return (
      <Layout>
        <header className={headerStyle}>
          <Heading>Dynamic Grid Layout</Heading>
          <Text>
            CSS Grid can be used for essentially any placement of elements you
            could ever need..
          </Text>
        </header>

        <div className={gridContainerStyle}>
          <div className={block1Style}>#1</div>
          <div className={block2Style}>#2</div>
          <div className={block3Style}>#3</div>
          <div className={block4Style}>#4</div>
          <div className={block5Style}>#5</div>
          <div className={block6Style}>#6</div>
          <div className={block7Style}>#7</div>
        </div>
      </Layout>
    );
  },
};
