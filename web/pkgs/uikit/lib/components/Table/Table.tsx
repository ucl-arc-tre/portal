import {
  memo,
  TableHTMLAttributes,
  forwardRef,
} from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../..';

export const NAME = 'ucl-uikit-table';

export interface TableProps
  extends TableHTMLAttributes<HTMLTableElement> {
  testId?: string;
}

export type Ref = HTMLTableElement;

const Table = forwardRef<Ref, TableProps>(
  (
    { testId = NAME, className, children, ...props },
    ref
  ) => {
    const [theme] = useTheme();

    const baseStyle = css`
      border-collapse: collapse;
      font-family: ${theme.font.family.primary};
      color: ${theme.color.text.primary};
      text-align: left;

      th,
      td {
        padding: ${theme.padding.p8};
        border-bottom: 1px solid
          ${theme.color.neutral.grey20};
      }

      thead {
        th {
          padding-bottom: ${theme.padding.p2};
          font-weight: 400;
          color: ${theme.color.text.secondary};
        }
      }

      tbody {
        th {
          font-weight: 700;
        }
      }
    `;

    const style = cx(NAME, baseStyle, className);

    return (
      <table
        ref={ref}
        className={style}
        data-testid={testId}
        {...props}
      >
        {children}
      </table>
    );
  }
);

export default memo(Table);
