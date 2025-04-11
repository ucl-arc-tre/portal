import { memo, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../..';

export const NAME = 'ucl-uikit-header__bottom--breadcrumbs';

export interface HeaderBottomBreadcrumbsProps
  extends HTMLAttributes<HTMLElement> {
  testId?: string;
}

const HeaderBottomBreadcrumbs = ({
  testId = NAME,
  className,
  children,
  ...props
}: HeaderBottomBreadcrumbsProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    color: ${theme.color.text.primary};
    padding: ${theme.padding.p16} 60px;
    box-sizing: border-box;
    border-bottom: 1px solid ${theme.color.neutral.grey15};
    font-size: ${theme.font.size.f14};
  `;

  const style = cx(NAME, baseStyle, className);

  const listStyle = css`
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    gap: ${theme.margin.m4};
    list-style: none;
  `;

  return (
    <nav
      className={style}
      data-testid={testId}
      {...props}
    >
      <ul className={listStyle}>{children}</ul>
    </nav>
  );
};

export default memo(HeaderBottomBreadcrumbs);
