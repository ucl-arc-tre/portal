import { HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../../theme';

export const NAME = 'ucl-uikit-layout';

export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  testId?: string;
}

const Layout = ({
  children,
  testId = NAME,
  className,
  ...props
}: LayoutProps) => {
  const [theme] = useTheme();

  /**
   * Implements the Design System grid layout, as defined in the UCL Design System UI Kit
   * @see https://www.figma.com/design/8Sm5PxWOWJYpYXAzhRzUzt/UCL-Design-System-UI-Kit?node-id=1-286&p=f&t=bVPuyuMQfb0t2GTL-0
   *
   * CSS Implementation Details:
   * - CSS Grid layout with responsive columns: 4 (mobile), 8 (tablet), 12 (desktop)
   * - Max-width: 1536px
   *
   * - The Figma design uses the terms "Gutters" and "Margins":
   *   - "Gutters": Implemented using the `gap` property
   *   - "Margins": Implemented using the `padding` property, in order that `margin: 0 auto` centres the layout
   *
   * Responsive approach:
   * - Mobile-first: Default styles apply to all viewport widths (0px+)
   * - Media queries in `mq` blocks apply at specified breakpoints and wider
   */
  const baseStyle = css`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px; // "Gutter"
    max-width: ${theme.breakpoints.desktopLarge}px; // 1536px
    margin: 0 auto;
    padding: 0 16px; // "Margin"

    ${theme.mq.tablet} {
      grid-template-columns: repeat(8, 1fr);
      padding: 0 32px; // "Margin"
      gap: 24px; // "Gutter"
    }

    ${theme.mq.desktop} {
      grid-template-columns: repeat(12, 1fr);
      padding: 0 64px; // "Margin"
    }

    ${theme.mq.desktopLarge} {
      gap: 32px; // "Gutter"
    }

    // To prevent the content edges hitting the viewport boundary at desktopLarge breakpoint,
    // the breakpoint here is slightly wider.
    ${theme.mq.custom(1660)} {
      padding: 0; // "Margin" is removed, so the layout <div> takes up the full 1536px width
    }
  `;

  const style = cx(baseStyle, className);

  return (
    <div
      className={style}
      data-testid={testId}
      {...props}
    >
      {children}
    </div>
  );
};

export default Layout;
