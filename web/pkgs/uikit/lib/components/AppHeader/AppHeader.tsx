import { memo, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../../../lib';
import AppHeaderTop, {
  HEIGHT as APP_HEADER_TOP_HEIGHT,
} from './AppHeaderTop';
import AppHeaderBottom, {
  HEIGHT as APP_HEADER_BOTTOM_HEIGHT,
} from './AppHeaderBottom';
import AppHeaderNav from './AppHeaderNav';

export const NAME = 'ucl-timetable-app-header';

export const Z_INDEX = 3;

export const HEIGHT =
  APP_HEADER_TOP_HEIGHT + APP_HEADER_BOTTOM_HEIGHT;

export interface AppHeaderProps
  extends HTMLAttributes<HTMLDivElement> {
  fixed?: boolean;
  sticky?: boolean;
  testId?: string;
}

const AppHeader = ({
  fixed = true,
  sticky = false,
  testId = NAME,
  className,
  children,
  ...props
}: AppHeaderProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    background-color: ${theme.color.neutral.white};
    color: ${theme.color.text.primary};
    font-family: ${theme.font.family.primary};
  `;

  const fixedStyle = css`
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    z-index: ${Z_INDEX};
  `;

  const stickyStyle = css`
    position: sticky;
    top: -${APP_HEADER_TOP_HEIGHT}px;
  `;

  const style = cx(
    NAME,
    baseStyle,
    fixed && fixedStyle,
    sticky && stickyStyle,
    className
  );

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

const MemoAppHeader = memo(AppHeader);

export interface IHeaderSubComponents {
  Top: typeof AppHeaderTop;
  Bottom: typeof AppHeaderBottom;
  Nav: typeof AppHeaderNav;
}

const AppHeaderWithSubComponents =
  MemoAppHeader as typeof MemoAppHeader &
    IHeaderSubComponents;

AppHeaderWithSubComponents.Top = AppHeaderTop;
AppHeaderWithSubComponents.Bottom = AppHeaderBottom;
AppHeaderWithSubComponents.Nav = AppHeaderNav;

export default AppHeaderWithSubComponents;
