import { memo, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../../../lib';

export const NAME = 'ucl-timetable-app-header__bottom';

export const HEIGHT = 48;

export interface AppHeaderBottomProps
  extends HTMLAttributes<HTMLDivElement> {
  testId?: string;
}

const AppHeaderBottom = ({
  testId = NAME,
  className,
  children,
  ...props
}: AppHeaderBottomProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    height: ${HEIGHT}px;
    padding: 0 ${theme.padding.p16};
    line-height: 48px;
    display: flex;
    align-items: center;
    background-color: ${theme.color.display
      .greenDark}; // default header/logo colour
    color: inherit;
  `;

  const style = cx(NAME, baseStyle, className);

  return (
    <div
      className={style}
      data-testid={testId}
      {...props}
    >
      {children}
    </div>
  );
};

export default memo(AppHeaderBottom);
