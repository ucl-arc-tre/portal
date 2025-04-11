import React, { LiHTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import Link from '../Link';
import { Link as InternalLink, useLocation } from 'wouter';
import { useAppMenu } from './AppMenu.context';
import useTheme from '../../theme/useTheme';

export const NAME = 'ucl-app-menu__item';

export interface AppMenuItemProps extends LiHTMLAttributes<HTMLLIElement> {
  testId?: string;
  icon?: React.ReactNode;
  internalLink?: string;
  externalLink?: string;
}

const AppMenuItem: React.FC<AppMenuItemProps> = ({
  testId = NAME,
  icon,
  children,
  className,
  internalLink,
  externalLink,
  onClick,
  ...props
}) => {
  const isClickable = !!(onClick || internalLink || externalLink);

  const [theme] = useTheme();
  const { toggleMenu } = useAppMenu();
  const [location] = useLocation();
  const isCurrent = internalLink ? location === internalLink : false;

  const handleClick = (e: React.MouseEvent<Element, MouseEvent>) => {
    if (isCurrent) {
      e.preventDefault();
      toggleMenu(); // Close the menu
    }
    if (onClick) {
      onClick(e as unknown as React.MouseEvent<HTMLLIElement, MouseEvent>);
    }
  };

  const baseStyle = css`
    height: 40px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    font-family: ${theme.font.family.primary};
    font-size: ${theme.font.size.f16};
    color: ${theme.color.text.secondary};
  `;

  const clickableMenuItemStyle = css`
    color: ${theme.color.text.primary};
    &:hover {
      background-color: ${theme.color.interaction.blue5};
    }
    &:focus-visible {
      outline: none;
      box-shadow: ${theme.boxShadow.focus};
      z-index: 1;
    }
  `;

  const menuLinkStyle = css`
    text-decoration: none;
    color: ${theme.color.text.primary};
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    &:hover {
      background-color: ${theme.color.interaction.blue5};
    }
    &:visited {
      color: ${theme.color.text.primary};
    }
    &:focus-visible {
      outline: none;
      box-shadow: ${theme.boxShadow.focus};
      z-index: 1;
    }
  `;

  const iconContainerStyle = css`
    display: inline-flex;
    align-items: center;
    margin-right: 8px;
  `;

  const style = cx(
    NAME,
    baseStyle,
    isClickable && clickableMenuItemStyle,
    className
  );

  const content = (
    <>
      {React.isValidElement(icon) && (
        <span className={iconContainerStyle}>{icon}</span>
      )}
      {children}
    </>
  );

  if (internalLink) {
    // if a link is provided, return a list item with a link
    return (
      <InternalLink
        to={internalLink}
        asChild
        onClick={handleClick}
      >
        <Link
          noVisited
          className={menuLinkStyle}
          role='menuitem'
          tabIndex={0}
          aria-label={
            isCurrent ? `${children} - Currently selected` : undefined
          }
        >
          <li
            className={style}
            data-testid={testId}
            {...props}
          >
            {content}
          </li>
        </Link>
      </InternalLink>
    );
  }

  if (externalLink) {
    // if an external link is provided, return a list item with an external link
    return (
      <Link
        href={externalLink}
        noVisited
        className={menuLinkStyle}
        role='menuitem'
        tabIndex={0}
      >
        <li
          className={style}
          data-testid={testId}
          {...props}
        >
          {content}
        </li>
      </Link>
    );
  }

  return (
    // if no link is provided, return a simple list item
    <li
      tabIndex={isClickable ? 0 : -1}
      role='menuitem'
      aria-disabled={!isClickable}
      className={style}
      data-testid={testId}
      onClick={onClick}
      {...props}
    >
      {content}
    </li>
  );
};

export default AppMenuItem;
