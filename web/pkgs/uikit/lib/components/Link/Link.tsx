import {
  memo,
  forwardRef,
  AnchorHTMLAttributes,
} from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../../theme';

export const NAME = 'ucl-link';

export interface LinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  noVisited?: boolean;
  testId?: string;
}

export type Ref = HTMLAnchorElement;

const Link = forwardRef<Ref, LinkProps>(
  (
    {
      noVisited = false,
      testId = NAME,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [theme] = useTheme();

    const baseStyle = css`
      color: ${theme.color.link.default};
      font-family: ${theme.font.family.primary};

      &:hover {
        color: ${theme.color.link.hover};
      }

      &:active {
        color: ${theme.color.link.visited};
      }
    `;

    const visitedStyle = css`
      &:visited {
        color: ${theme.color.link.visited};
      }
    `;

    const noVisitedStyle = css`
      &:visited {
        color: ${theme.color.link.default};
      }
    `;

    const style = cx(
      NAME,
      baseStyle,
      !noVisited && visitedStyle,
      noVisited && noVisitedStyle,
      className
    );

    return (
      <a
        ref={ref}
        className={style}
        data-testid={testId}
        {...props}
      >
        {children}
      </a>
    );
  }
);

export default memo(Link);
