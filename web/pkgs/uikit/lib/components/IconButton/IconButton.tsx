import { memo, ButtonHTMLAttributes, forwardRef } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';

export const NAME = 'ucl-icon-button';

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  testId?: string;
}

export type Ref = HTMLButtonElement;

const IconButton = forwardRef<Ref, IconButtonProps>(
  ({ testId = NAME, className, children, ...props }, ref) => {
    const [theme] = useTheme();

    const baseStyle = css`
      background-color: transparent;
      border: none;
      padding: 0;
      vertical-align: middle;
      outline: none;
      cursor: pointer;
      color: inherit;
    `;

    const hoverStyle = css`
      &:hover {
        opacity: 0.7;
      }
    `;

    const focusStyle = css`
      &:focus-visible {
        box-shadow: ${theme.boxShadow.focus};
      }
    `;

    const disabledStyle = css`
      cursor: not-allowed;
    `;

    const style = cx(
      NAME,
      baseStyle,
      !props.disabled && hoverStyle,
      !props.disabled && focusStyle,
      props.disabled && disabledStyle,
      className
    );

    return (
      <button
        ref={ref}
        className={style}
        data-testid={testId}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export default memo(IconButton);
