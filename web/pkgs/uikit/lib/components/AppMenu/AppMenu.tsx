import { HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../../theme';
import AppMenuProvider from './AppMenu.context';
import AppMenuContent from './AppMenuContent';
import AppMenuItem from './AppMenuItem';
import AppMenuDivider from './AppMenuDivider';
import AppMenuTrigger from './AppMenuTrigger';

export const NAME = 'ucl-app-menu';

export interface AppMenuProps
  extends HTMLAttributes<HTMLDivElement> {
  testId?: string;
  defaultOpen?: boolean;
}

const AppMenu = ({
  testId = NAME,
  defaultOpen = false,
  children,
  className,
  ...props
}: AppMenuProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    position: relative;
    font-family: ${theme.font.family.primary};
  `;

  const style = cx(NAME, baseStyle, className);

  return (
    <div
      className={style}
      data-testid={testId}
      {...props}
    >
      <AppMenuProvider defaultOpen={defaultOpen}>
        {children}
      </AppMenuProvider>
    </div>
  );
};

export interface IAppMenuSubComponents {
  Trigger: typeof AppMenuTrigger;
  Content: typeof AppMenuContent;
  MenuItem: typeof AppMenuItem;
  Divider: typeof AppMenuDivider;
}

const AppMenuWithSubComponents = AppMenu as typeof AppMenu &
  IAppMenuSubComponents;

AppMenuWithSubComponents.Trigger = AppMenuTrigger;
AppMenuWithSubComponents.Content = AppMenuContent;
AppMenuWithSubComponents.MenuItem = AppMenuItem;
AppMenuWithSubComponents.Divider = AppMenuDivider;

export default AppMenuWithSubComponents;
