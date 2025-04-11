import React, { HtmlHTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';

export const NAME = 'ucl-app-menu__divider';

export interface AppMenuDividerProps
  extends Omit<
    HtmlHTMLAttributes<HTMLHRElement>,
    'children'
  > {
  testId?: string;
}

const AppMenuDivider: React.FC<AppMenuDividerProps> = ({
  testId = NAME,
  className,
  ...props
}) => {
  const [theme] = useTheme();

  const baseStyle = css`
    margin: 0;
    height: 1px;
    border: none;
    background-color: ${theme.color.neutral.grey20};
  `;

  const style = cx(NAME, baseStyle, className);

  return (
    <hr
      className={style}
      data-testid={testId}
      {...props}
    />
  );
};

export default AppMenuDivider;
