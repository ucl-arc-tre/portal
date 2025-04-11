import { memo } from 'react';
import { css, cx } from '@emotion/css';
import { Link, LinkProps, useTheme } from '../..';

export const NAME = 'ucl-uikit-footer__nav-link';

export interface FooterNavLinkProps extends LinkProps {
  href: string;
  testId?: string;
}

const FooterNavLink = ({
  href,
  testId = NAME,
  className,
  children,
  ...props
}: FooterNavLinkProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    margin: ${theme.margin.m8} 0;
    text-decoration: none;
    color: ${theme.color.text.inverted};
    transition: color 0.2s ease-out;

    &:focus-visible {
      outline: none;
      box-shadow: ${theme.boxShadow.focus};
    }

    &:visited {
      color: ${theme.color.text.inverted};
    }

    &:hover {
      text-decoration: underline;
      color: ${theme.color.text.inverted};
    }
  `;

  const style = cx(NAME, baseStyle, className);

  return (
    <Link
      href={href}
      className={style}
      data-testid={testId}
      {...props}
    >
      {children}
    </Link>
  );
};

export default memo(FooterNavLink);
