import { memo, HTMLAttributes, forwardRef } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';

export const NAME = 'ucl-uikit-paragrah';

export interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: 'standfirst' | 'body' | 'small';
  emphasis?: 'high' | 'medium';
  margins?: boolean;
  testId?: string;
}

export type Ref = HTMLParagraphElement;

const Paragraph = forwardRef<Ref, ParagraphProps>(
  (
    {
      size = 'body',
      emphasis = 'high',
      margins = true,
      testId = NAME,
      className,
      ...props
    },
    ref
  ) => {
    const [theme] = useTheme();

    const {
      font: { size: fontSize, lineHeight },
      color: { text },
    } = theme;

    const baseStyle = css`
      font-family: ${theme.font.family.primary};
      color: ${emphasis === 'medium' ? text.secondary : text.primary};
    `;

    const standfirstStyle = css`
      font-size: ${fontSize.f20};
      line-height: ${lineHeight.h140};
      @media screen and (min-width: ${theme.breakpoints.desktop}px) {
        font-size: ${fontSize.f24};
        line-height: ${lineHeight.h150};
      }
    `;

    const bodyStyle = css`
      font-size: ${fontSize.f16};
      line-height: ${lineHeight.h150};
      @media screen and (min-width: ${theme.breakpoints.desktop}px) {
        font-size: ${fontSize.f18};
      }
    `;

    const smallStyle = css`
      font-size: ${fontSize.f14};
      line-height: ${lineHeight.h150};
      @media screen and (min-width: ${theme.breakpoints.desktop}px) {
        font-size: ${fontSize.f14};
      }
    `;

    const noMarginsStyle = css`
      margin: 0;
    `;

    const style = cx(
      NAME,
      baseStyle,
      size === 'standfirst' && standfirstStyle,
      size === 'body' && bodyStyle,
      size === 'small' && smallStyle,
      margins === false && noMarginsStyle,
      className
    );

    return (
      <p
        ref={ref}
        className={style}
        data-testid={testId}
        {...props}
      />
    );
  }
);

export default memo(Paragraph);
