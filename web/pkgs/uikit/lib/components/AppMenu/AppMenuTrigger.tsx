import React from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../../theme';
import IconButton, { IconButtonProps } from '../IconButton';
import { useAppMenu } from './AppMenu.context';

export const NAME = 'ucl-app-menu__trigger';

export interface AppMenuTriggerProps
  extends IconButtonProps {}

const AppMenuTrigger: React.FC<AppMenuTriggerProps> = ({
  testId = NAME,
  className,
  children,
  ...props
}) => {
  const [theme] = useTheme();
  const { isOpen, toggleMenu, triggerRef } = useAppMenu();

  const baseStyle = css`
    &:focus-visible {
      outline: none;
      box-shadow: ${theme.boxShadow.focus};
      z-index: 1;
    }
  `;

  const style = cx(NAME, baseStyle, className);

  return (
    <IconButton
      id='app-menu-button'
      ref={triggerRef}
      className={style}
      onClick={toggleMenu}
      aria-label='Menu button'
      aria-controls='app-menu'
      aria-haspopup='true'
      aria-expanded={isOpen ? 'true' : 'false'}
      data-testid={testId}
      tabIndex={0}
      {...props}
    >
      {children}
    </IconButton>
  );
};

export default AppMenuTrigger;
