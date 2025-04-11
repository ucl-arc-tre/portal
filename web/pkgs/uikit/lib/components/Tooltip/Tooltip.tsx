import { memo, forwardRef, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../../theme';

export const NAME = 'ucl-tooltip';

export interface TooltipProps
  extends HTMLAttributes<HTMLSpanElement> {
  testId?: string;
}

export type Ref = HTMLSpanElement;

const Tooltip = forwardRef<Ref, TooltipProps>(
  (
    { testId = NAME, className, children, ...props },
    ref
  ) => {
    const [theme] = useTheme();

    const baseStyle = css`
      background-color: ${theme.color.neutral.grey90};
      color: ${theme.color.text.inverted};
      font-family: ${theme.font.family.primary};
      height: 32px;
      padding: 4px 8px 4px 8px;
      border-radius: ${theme.border.b2};
      font-size: 16px;
      display: inline;
    `;

    const style = cx(NAME, baseStyle, className);

    return (
      <span
        ref={ref}
        className={style}
        data-testid={testId}
        {...props}
      >
        {children}
      </span>
    );
  }
);

export default memo(Tooltip);
