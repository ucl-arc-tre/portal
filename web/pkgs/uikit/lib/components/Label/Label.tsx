// This Input component needs to be fully implemented.

import {
  LabelHTMLAttributes,
  forwardRef,
  memo,
} from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';

export const NAME = 'ucl-label';

export interface LabelProps
  extends LabelHTMLAttributes<HTMLLabelElement> {
  testId?: string;
  type?: 'bold' | 'standard' | 'small';
}

export type Ref = HTMLLabelElement;

const Label = forwardRef<Ref, LabelProps>(
  (
    {
      testId = NAME,
      type = 'standard',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [theme] = useTheme();

    const baseStyle = css`
      color: ${theme.color.neutral.grey80};
      font-family: ${theme.font.family.primary};
      font-size: ${theme.font.size.f16};
    `;

    const boldStyle = css`
      font-size: ${theme.font.size.f16};
      font-weight: ${theme.font.weight.bold};
      line-height: ${theme.font.lineHeight.h150};
    `;

    const standardStyle = css`
      font-size: ${theme.font.size.f16};
      font-weight: ${theme.font.weight.regular};
      line-height: ${theme.font.lineHeight.h150};
    `;

    const smallStyle = css`
      font-size: ${theme.font.size.f14};
      font-weight: ${theme.font.weight.regular};
      line-height: ${theme.font.lineHeight.h140};
    `;

    const style = cx(
      NAME,
      baseStyle,
      type === 'bold' && boldStyle,
      type === 'standard' && standardStyle,
      type === 'small' && smallStyle,
      className
    );

    return (
      <label
        ref={ref}
        className={style}
        data-testid={testId}
        {...props}
      >
        {children}
      </label>
    );
  }
);

export default memo(Label);
