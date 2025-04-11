import React, { LiHTMLAttributes, useEffect } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import { useAppMenu } from './AppMenu.context';
import AppMenuItem from './AppMenuItem';
import Icon from '../Icon';
import { createPortal } from 'react-dom';
import useMediaQuery from '../../../src/hooks/useMediaQuery';

export const NAME = 'ucl-app-menu__content';

export interface AppMenuContentProps
  extends LiHTMLAttributes<HTMLUListElement> {
  testId?: string;
}

const AppMenuContent: React.FC<AppMenuContentProps> = ({
  testId = NAME,
  children,
  className,
  ...props
}) => {
  const { isOpen, contentRef, toggleMenu } = useAppMenu();
  const [theme] = useTheme();

  const isDesktop = useMediaQuery(
    `(min-width: ${theme.breakpoints.desktop}px)`
  );

  const handleBackButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      toggleMenu();
    }
  };

  const baseStyle = css`
    z-index: 9999;
    position: absolute;
    display: none;
    top: 16px;
    min-width: 140px;
    white-space: nowrap;
    cursor: default;
    background-color: white;
    box-shadow: ${theme.boxShadow.y1};
    border: ${theme.border.b1} solid ${theme.color.neutral.grey20};
    padding-left: 0;
    padding-right: 0;
    color: ${theme.color.text.primary};
    list-style: none;

    @media (max-width: ${theme.breakpoints.desktop}px) {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      border: none;
      box-shadow: none;
      padding: 0;
      margin: 0;
      overflow-y: auto;
      a {
        height: auto;
      }
    }
  `;

  const expandedStyle = css`
    display: block;
  `;

  const backMenuItemStyle = css`
    cursor: pointer;

    @media (min-width: ${theme.breakpoints.desktop}px) {
      display: none;
    }
  `;

  useEffect(() => {
    const mainDiv = document.getElementById('root');
    if (mainDiv) {
      if (!isDesktop && isOpen) {
        mainDiv.style.display = 'none';
      } else {
        mainDiv.style.display = '';
      }
    }
  }, [isOpen, isDesktop]);

  const style = cx(NAME, baseStyle, isOpen && expandedStyle, className);

  const menuContent = (
    <ul
      id='app-menu'
      role='menu'
      aria-labelledby='app-menu-button'
      ref={contentRef}
      className={style}
      data-testid={testId}
      tabIndex={-1}
      {...props}
    >
      <AppMenuItem
        onClick={toggleMenu}
        onKeyDown={handleBackButtonKeyDown}
        icon={<Icon.ChevronLeft />}
        className={backMenuItemStyle}
        aria-label='Go Back'
      >
        Back
      </AppMenuItem>
      {children}
    </ul>
  );

  return !isDesktop ? createPortal(menuContent, document.body) : menuContent;
};

export default AppMenuContent;
