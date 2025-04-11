import React, { HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { Icon } from '../';
import Breadcrumb from './Breadcrumb';
import { useTheme } from '../../theme';

const NAME = 'ucl-timetable-breadcrumbs';

export interface BreadcrumbsProps
  extends HTMLAttributes<HTMLElement> {
  testId?: string;
}

const Breadcrumbs = ({
  testId = NAME,
  className,
  children,
  ...props
}: BreadcrumbsProps) => {
  const [theme] = useTheme();

  const separatorStyle = css`
    display: inline-flex;
    align-items: center;
    color: inherit;
    font-family: ${theme.font.family.primary};
  `;

  const chevronIconStyle = css`
    margin: 0 8px;
  `;

  const style = cx(NAME, className);

  const breadcrumbItems = React.Children.toArray(
    children
  ).map((child, index, array) => (
    <span
      key={index}
      className={separatorStyle}
    >
      {child}
      {index < array.length - 1 && (
        <Icon.ChevronRight
          size={20}
          className={chevronIconStyle}
        />
      )}
    </span>
  ));

  return (
    <nav
      className={style}
      data-testid={testId}
      {...props}
    >
      {breadcrumbItems}
    </nav>
  );
};

Breadcrumbs.Breadcrumb = Breadcrumb;

export default Breadcrumbs;
