import { memo, HTMLAttributes, forwardRef } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';

export const NAME = 'ucl-heading';

export interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
  margins?: boolean;
  testId?: string;
}

export type Ref = HTMLHeadingElement;

const Heading = forwardRef<Ref, HeadingProps>(
  (
    {
      level = 1,
      margins = true,
      testId = NAME,
      className,
      ...props
    },
    ref
  ) => {
    const [theme] = useTheme();

    const {
      font: { size, lineHeight },
    } = theme;

    const level1Style = css`
      font-size: ${size.f36};
      line-height: ${lineHeight.h130};
      @media screen and (min-width: ${theme.breakpoints
          .desktop}px) {
        font-size: ${size.f40};
      }
    `;

    const level2Style = css`
      font-size: ${size.f28};
      line-height: ${lineHeight.h140};
      @media screen and (min-width: ${theme.breakpoints
          .desktop}px) {
        font-size: ${size.f32};
        line-height: ${lineHeight.h130};
      }
    `;

    const level3Style = css`
      font-size: ${size.f20};
      line-height: ${lineHeight.h140};
      @media screen and (min-width: ${theme.breakpoints
          .desktop}px) {
        font-size: ${size.f24};
      }
    `;

    const level4Style = css`
      font-size: ${size.f16};
      line-height: ${lineHeight.h150};
      @media screen and (min-width: ${theme.breakpoints
          .desktop}px) {
        font-size: ${size.f18};
      }
    `;

    const baseStyle = css`
      font-family: ${theme.font.family.primary};
      font-weight: bold;
      color: ${theme.color.text.primary};
    `;

    const noMarginsStyle = css`
      margin: 0;
    `;

    const style = cx(
      NAME,
      baseStyle,
      level === 1 && level1Style,
      level === 2 && level2Style,
      level === 3 && level3Style,
      level === 4 && level4Style,
      margins === false && noMarginsStyle,
      className
    );

    const HeadingTag = `h${level}` as
      | 'h1'
      | 'h2'
      | 'h3'
      | 'h4';

    return (
      <HeadingTag
        ref={ref}
        className={style}
        data-testid={testId}
        {...props}
      />
    );
  }
);

export default memo(Heading);
