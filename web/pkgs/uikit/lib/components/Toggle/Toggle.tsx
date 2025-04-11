import {
  forwardRef,
  memo,
  ButtonHTMLAttributes,
} from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../../theme';
import Handle from './ToggleHandle';

export const NAME = 'ucl-toggle';

export interface ToggleProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
}

export type Ref = HTMLButtonElement;

const Toggle = forwardRef<Ref, ToggleProps>(
  (
    {
      checked = false,
      disabled = false,
      className,
      onClick,
      ...props
    }: ToggleProps,
    ref
  ) => {
    const [theme] = useTheme();

    const baseStyle = css`
      border: none;
      outline: none;
      padding: 0;
      box-sizing: border-box;
      position: relative;
      width: 44px;
      height: 22px;
      border-radius: 16px;
      background-color: ${theme.color.neutral.grey40};
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
    `;

    const checkedStyle = css`
      background-color: ${theme.color.interaction.blue70};
    `;

    // const activeStyle = css`
    //   background-color: ${checked ? theme.directColorActive : theme.neutralColorActive};
    // `;

    const disabledStyle = css`
      background-color: ${theme.color.neutral.grey20};
      cursor: not-allowed;
    `;

    const style = cx(
      NAME,
      baseStyle,
      checked && checkedStyle,
      disabled && disabledStyle,
      className
    );

    return (
      <button
        data-test-id={NAME}
        ref={ref}
        role='toggle'
        aria-checked={checked}
        aria-disabled={disabled}
        className={style}
        onClick={!disabled ? onClick : undefined}
        {...props}
      >
        <Handle
          checked={checked}
          disabled={disabled}
          // active={active}
        />
      </button>
    );
  }
);

export default memo(Toggle);
