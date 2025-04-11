import { memo } from 'react';
import { css, cx } from '@emotion/css';
import { Link, LinkProps } from '../';
import { useLocation, Link as InternalLink } from 'wouter';

const NAME = 'ucl-timetable-breadcrumb';
const ACTIVE_NAME = 'ucl-timetable-breadcrumb--active';
const INACTIVE_NAME = 'ucl-timetable-breadcrumb--inactive';

export interface BreadcrumbProps extends LinkProps {
  testId?: string;
  uri: string;
}

const Breadcrumb = ({
  testId = NAME,
  uri,
  className,
  children,
  ...props
}: BreadcrumbProps) => {
  const [location] = useLocation();

  const activeBreadcrumb = uri === location;

  const baseActiveBreadcrumbStyle = css``;

  const baseInactiveBreadcrumbStyle = css`
    color: inherit;
    &:visited {
      color: inherit;
    }
    text-decoration: none;
    &:hover {
      text-decoration: underline;
      color: inherit;
    }
  `;

  const activeBreadcrumbStyle = cx(
    baseActiveBreadcrumbStyle,
    NAME,
    ACTIVE_NAME,
    className
  );
  const inactiveBreadcrumbStyle = cx(
    baseInactiveBreadcrumbStyle,
    NAME,
    INACTIVE_NAME,
    className
  );

  if (activeBreadcrumb) {
    return (
      <span
        className={activeBreadcrumbStyle}
        data-testid={testId}
        {...props}
      >
        {children}
      </span>
    );
  } else {
    return (
      <InternalLink
        to={uri}
        asChild
      >
        <Link
          className={inactiveBreadcrumbStyle}
          data-testid={testId}
          {...props}
        >
          {children}
        </Link>
      </InternalLink>
    );
  }
};

export default memo(Breadcrumb);
