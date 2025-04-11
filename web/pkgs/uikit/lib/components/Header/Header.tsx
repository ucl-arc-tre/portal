import { memo, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { Icon, useTheme } from '../..';
import UclLogo2 from '../UclLogo/UclLogo2';
import HeaderBottomBreadcrumbs from './HeaderBottomBreadcrumbs';
import HeaderBottomHeadingAndAvatar from './HeaderBottomHeadingAndAvatar';
import HeaderBreadcrumb from './HeaderBreadcrumb';

export const NAME = 'ucl-uikit-header';
export const HEADER_TOP_HEIGHT = 72;
export const Z_INDEX = 3;

export interface HeaderProps
  extends HTMLAttributes<HTMLElement> {
  variant: 'breadcrumbs' | 'avatar';
  title?: string;
  heading?: string;
  subheading?: string;
  name?: string;
  role?: string;
  profileImageSrc?: string;
  menu?: boolean;
  fixed?: boolean;
  sticky?: boolean;
  testId?: string;
}

const Header = ({
  variant,
  title,
  heading,
  subheading,
  name,
  role,
  profileImageSrc,
  menu = false,
  fixed = false,
  sticky = false,
  testId = NAME,
  className,
  children,
  ...props
}: HeaderProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    background-color: ${theme.color.neutral.white};
    font-family: ${theme.font.family.primary};
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
    top: -${HEADER_TOP_HEIGHT}px;
  `;

  const style = cx(
    NAME,
    baseStyle,
    fixed && fixedStyle,
    sticky && stickyStyle,
    className
  );

  const topStyle = css`
    position: relative;
    height: ${HEADER_TOP_HEIGHT}px;
    background-color: ${theme.color.neutral.grey90};
    color: ${theme.color.text.inverted};
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const uclLogoStyle = css`
    position: absolute;
    left: 30px;
    bottom: 0;
    height: 57px;
    color: ${theme.color.neutral.grey90};
  `;

  const titleStyle = css`
    display: block;
    margin: 0;
    font-size: ${theme.font.size.f18};
    font-weight: 700;
    text-align: center;
  `;

  const menuButtonStyle = css`
    position: absolute;
    right: 60px;
    height: 40px;
    padding: 0 ${theme.padding.p16};
    background-color: ${theme.color.neutral.white};
    color: ${theme.color.text.primary};
    font-size: ${theme.font.size.f16};
    font-weight: 700;
    border: none;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.15s ease-out;

    &:hover {
      color: ${theme.color.text.primary};
      background-color: ${theme.color.neutral.grey5};
    }
  `;

  const menuButtonIconStyle = css`
    margin-right: ${theme.margin.m8};
    margin-top: -2px;
  `;

  return (
    <header
      className={style}
      data-testid={testId}
      {...props}
    >
      <div className={topStyle}>
        <UclLogo2
          className={uclLogoStyle}
          backgroundFill={theme.color.neutral.white}
        />
        {title && <h1 className={titleStyle}>{title}</h1>}
        {menu && (
          <button className={menuButtonStyle}>
            <Icon.Menu className={menuButtonIconStyle} />
            MENU
          </button>
        )}
      </div>

      {variant === 'breadcrumbs' && (
        <HeaderBottomBreadcrumbs>
          {children}
        </HeaderBottomBreadcrumbs>
      )}
      {variant === 'avatar' && (
        <HeaderBottomHeadingAndAvatar
          heading={heading!}
          subheading={subheading!}
          name={name!}
          role={role!}
          profileImageSrc={profileImageSrc}
        />
      )}
    </header>
  );
};

const MemoAppHeader = memo(Header);

export interface IHeaderSubComponents {
  Breadcrumb: typeof HeaderBreadcrumb;
}

const HeaderWithSubComponents =
  MemoAppHeader as typeof MemoAppHeader &
    IHeaderSubComponents;

HeaderWithSubComponents.Breadcrumb = HeaderBreadcrumb;

export default HeaderWithSubComponents;
