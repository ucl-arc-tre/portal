import { memo, InputHTMLAttributes, forwardRef } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import marginsStyle, { MarginProps } from '../common/marginsStyle';

export const NAME = 'ucl-uikit-radio';

export interface RadioBaseProps extends InputHTMLAttributes<HTMLInputElement> {
  testId?: string;
}

export type RadioProps = RadioBaseProps & MarginProps;

export type Ref = HTMLInputElement;

const Radio = forwardRef<Ref, RadioProps>(
  ({ checked, disabled, testId = NAME, className, ...props }, ref) => {
    const [theme] = useTheme();

    const baseStyle = css`
      position: relative;
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border-width: ${theme.border.b1};
      border-style: solid;
      outline: none;
      box-sizing: border-box;
      color: ${theme.color.neutral.white};
      transition:
        background-color 0.15s ease-out,
        border-color 0.15s ease-out;
      cursor: pointer;
    `;

    const focusStyle = css`
      &:focus-within {
        box-shadow: ${theme.boxShadow.focus};
      }
    `;

    const checkedStyle = css`
      background-color: ${theme.color.interaction.blue70};
      border-color: ${theme.color.interaction.blue70};
      color: ${theme.color.neutral.white};
    `;

    const uncheckedStyle = css`
      background-color: ${theme.color.neutral.white};
      border-color: ${theme.color.neutral.grey60};
    `;

    const disabledStyle = css`
      background-color: ${theme.color.neutral.grey20};
      border-color: ${theme.color.neutral.grey20};
      cursor: not-allowed;
    `;

    const style = cx(
      NAME,
      baseStyle,
      marginsStyle(props, theme),
      !disabled && focusStyle,
      checked && checkedStyle,
      !checked && uncheckedStyle,
      disabled && disabledStyle,
      className
    );

    const hiddenInputStyle = css`
      cursor: inherit;
      position: absolute;
      opacity: 0;
      left: -1px;
      top: -1px;
      width: calc(100% + 2px);
      height: calc(100% + 2px);
      border-radius: 50%;
      border: none;
      margin: 0;
      padding: 0;
    `;

    const checkStyle = css`
      position: absolute;
      left: 5px;
      top: 5px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: ${theme.color.neutral.white};
      user-select: none;
      pointer-events: none;
    `;

    return (
      <span className={style}>
        <input
          type='radio'
          ref={ref}
          className={hiddenInputStyle}
          data-testid={testId}
          checked={checked}
          disabled={disabled}
          {...props}
        />
        {checked && <div className={checkStyle} />}
      </span>
    );
  }
);

export default memo(Radio);
