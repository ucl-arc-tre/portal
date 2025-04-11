import { memo, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { Icon, useTheme } from '../..';

export const NAME = 'ucl-uikit-header__breadcrumb';

export interface HeaderBreadcrumbProps
  extends HTMLAttributes<HTMLLIElement> {
  link?: boolean;
  testId?: string;
}

const HeaderBreadcrumb = ({
  link = false,
  testId = NAME,
  className,
  children,
  ...props
}: HeaderBreadcrumbProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    color: ${theme.color.text.primary};
    font-size: ${theme.font.size.f14};
  `;

  const textBaseStyle = css`
    & > a {
      text-decoration: none;

      &:visited {
        color: inherit;
      }

      &:hover {
        color: ${theme.color.neutral.black};
        text-decoration: underline;
      }
    }
  `;

  const nonLinkStyle = css`
    color: ${theme.color.text.secondary};
    font-weight: 700;
  `;

  const textStyle = cx(
    textBaseStyle,
    !link && nonLinkStyle
  );

  const chevronIconStyle = css`
    margin-left: ${theme.margin.m8};
    vertical-align: middle;
    color: ${theme.color.text.secondary};
  `;

  const style = cx(NAME, baseStyle, className);

  return (
    <li
      className={style}
      data-testid={testId}
      {...props}
    >
      <span className={textStyle}>{children}</span>
      {link && (
        <Icon.ChevronRight
          className={chevronIconStyle}
          size={20}
          strokeWidth={1.5}
        />
      )}
    </li>
  );
};

export default memo(HeaderBreadcrumb);
