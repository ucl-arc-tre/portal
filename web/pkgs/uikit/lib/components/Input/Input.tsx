import {
  memo,
  InputHTMLAttributes,
  forwardRef,
} from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';

export const NAME = 'ucl-input';

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  testId?: string;
}

export type Ref = HTMLInputElement;

const Input = forwardRef<Ref, InputProps>(
  ({ testId = NAME, className, ...props }, ref) => {
    const [theme] = useTheme();

    const baseStyle = css`
      height: ${theme.padding.p48};
      line-height: ${theme.padding.p48};
      box-sizing: border-box;
      padding: 0 ${theme.padding.p16};
      font-family: ${theme.font.family.primary};
      font-size: ${theme.font.size.f16};
      color: ${theme.color.text.primary};
      background-color: ${theme.color.neutral.white};
      border: ${theme.border.b1} solid
        ${theme.color.neutral.grey60};
      outline: none;

      &::placeholder {
        color: ${theme.color.text.muted};
      }
    `;

    const activeAndFocusStyle = css`
      &:focus-visible {
        box-shadow: ${theme.boxShadow.focus};
      }
    `;

    const disabledStyle = css`
      border-color: ${theme.color.neutral.grey20};
    `;

    const style = cx(
      NAME,
      baseStyle,
      !props.disabled && activeAndFocusStyle,
      props.disabled && disabledStyle,
      className
    );

    return (
      <input
        ref={ref}
        className={style}
        data-testid={testId}
        {...props}
      />
    );
  }
);

export default memo(Input);
