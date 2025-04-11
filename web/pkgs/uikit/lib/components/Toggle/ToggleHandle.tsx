import React, { memo } from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../../theme';

export const NAME = 'ucl-toggle__handle';

export interface ToggleHandleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  checked: boolean;
  disabled: boolean;
  // active: boolean;
}

const ToggleHandle = ({
  checked,
  disabled,
  // active,
  className,
}: ToggleHandleProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    box-sizing: border-box;
    width: 18px;
    height: 18px;
    border-radius: 9px;
    background-color: ${theme.color.neutral.white};
    position: absolute;
    top: 2px;
    left: 2px;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0, 35, 11, 0.2);
    transition:
      left 0.15s ease-in-out,
      width 0.15s ease-in-out,
      margin-left 0.15s ease-in-out;
  `;

  const checkedStyle = css`
    left: 24px;
  `;

  // const activeStyle = css`
  //   width: 24px;
  //   ${checked ? 'margin-left: -6px;' : ''}
  // `;

  const disabledStyle = css`
    background-color: ${theme.color.neutral.grey10};
  `;

  const style = cx(
    NAME,
    baseStyle,
    checked && checkedStyle,
    disabled && disabledStyle,
    className
  );

  return (
    <div
      data-test-id={NAME}
      className={style}
    />
  );
};

export default memo(ToggleHandle);
