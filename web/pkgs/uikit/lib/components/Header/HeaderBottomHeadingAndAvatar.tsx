import { memo, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { Icon, useTheme } from '../..';

export const NAME = 'ucl-uikit-header__avatar';
export const HEADER_TOP_HEIGHT = 72;
export const Z_INDEX = 3;

export interface HeaderProps
  extends HTMLAttributes<HTMLDivElement> {
  heading: string;
  subheading: string;
  name: string;
  role: string;
  profileImageSrc?: string;
  fixed?: boolean;
  sticky?: boolean;
  testId?: string;
}

const Header = ({
  heading,
  subheading,
  name,
  role,
  profileImageSrc,
  testId = NAME,
  className,
  ...props
}: HeaderProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    color: ${theme.color.text.primary};
    padding: ${theme.padding.p20} 60px;
    box-sizing: border-box;
    border-bottom: 1px solid ${theme.color.neutral.grey15};
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const style = cx(NAME, baseStyle, className);

  const headingsStyle = css`
    flex: 1;
  `;

  const headingStyle = css`
    margin: 0;
    font-size: ${theme.font.size.f24};
    font-weight: 400;
    line-height: 24px;
  `;

  const subheadingStyle = css`
    margin: ${theme.margin.m8} 0 0 0;
    color: ${theme.color.text.secondary};
    font-size: ${theme.font.size.f16};
    font-weight: 400;
    line-height: 16px;
  `;

  const avatarDropdownStyle = css`
    margin-top: -4px;
    margin-bottom: -4px;
    margin-right: -${theme.padding.p8}; // subtract padding-right
    padding: ${theme.padding.p8} ${theme.padding.p8};
    color: ${theme.color.text.primary};
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.15s ease-out;

    &:hover {
      background-color: ${theme.color.neutral.grey5};
    }
  `;

  const avatarStyle = css`
    margin-right: ${theme.margin.m16};
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
  `;

  const avatarImageStyle = css`
    width: 100%;
  `;

  const nameAndRoleStyle = css`
    flex: 1;
    font-size: ${theme.font.size.f14};
    color: ${theme.color.text.primary};
  `;

  const nameStyle = css`
    font-size: ${theme.font.size.f14};
  `;

  const roleStyle = css`
    color: ${theme.color.text.secondary};
  `;

  const chevronStyle = css`
    margin-left: ${theme.margin.m8};
  `;

  return (
    <div
      className={style}
      data-testid={testId}
      {...props}
    >
      <div className={headingsStyle}>
        <h1 className={headingStyle}>{heading}</h1>
        <h2 className={subheadingStyle}>{subheading}</h2>
      </div>
      <div className={avatarDropdownStyle}>
        <div className={avatarStyle}>
          <img
            className={avatarImageStyle}
            src={profileImageSrc}
            alt='Profile photo'
          />
        </div>
        <div className={nameAndRoleStyle}>
          <div className={nameStyle}>{name}</div>
          <div className={roleStyle}>{role}</div>
        </div>
        <Icon.ChevronDown
          className={chevronStyle}
          size={20}
        />
      </div>
    </div>
  );
};

export default memo(Header);
