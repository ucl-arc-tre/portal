import { memo, InputHTMLAttributes, forwardRef } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import Icon from '../Icon';
import marginsStyle, { MarginProps } from '../common/marginsStyle';

export const NAME = 'ucl-uikit-checkbox';

export interface CheckboxBaseProps
  extends InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
  testId?: string;
}

export type CheckboxProps = CheckboxBaseProps & MarginProps;

export type Ref = HTMLInputElement;

const Checkbox = forwardRef<Ref, CheckboxProps>(
  (
    {
      indeterminate, // takes precedence over checked
      checked,
      defaultChecked,
      disabled,
      testId = NAME,
      className,
      ...props
    },
    ref
  ) => {
    const [theme] = useTheme();

    const baseStyle = css`
      position: relative;
      display: inline-block;
      width: 24px;
      height: 24px;
      border-width: ${theme.border.b1};
      border-style: solid;
      border-radius: ${theme.radius.r2};
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
      indeterminate && checkedStyle,
      !checked && !indeterminate && uncheckedStyle,
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
      border-radius: 2px;
      border: none;
      margin: 0;
      padding: 0;
    `;

    const checkStyle = css`
      position: absolute;
      left: -1px;
      top: -1px;
      color: inherit;
      user-select: none;
      pointer-events: none;
      transition: color 0.15s ease-in-out;
    `;

    const indeterminateLineStyle = css`
      position: absolute;
      left: -1px;
      top: -1px;
    `;

    return (
      <span className={style}>
        <input
          type='checkbox'
          ref={ref}
          className={hiddenInputStyle}
          data-testid={testId}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          {...props}
        />
        {!indeterminate && checked && (
          <Icon.Empty
            className={checkStyle}
            size={24}
            strokeLinecap='square'
            strokeLinejoin='miter'
          >
            <polyline points='17 9 10 16 7 13' />
          </Icon.Empty>
        )}
        {indeterminate && (
          <Icon.Empty
            className={indeterminateLineStyle}
            size={24}
            strokeLinecap='square'
          >
            <line
              x1='7'
              y1='12'
              x2='17'
              y2='12'
            />
          </Icon.Empty>
        )}
      </span>
    );
  }
);

export default memo(Checkbox);
