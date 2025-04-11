import { useContext, memo } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import { PaginationContext } from './Pagination';

export const NAME = 'ucl-uikit-pagination__info';

export interface PaginationInfoProps
  extends React.HTMLAttributes<HTMLDivElement> {
  format?: 'pages' | 'items';
  itemsPluralName?: string;
  testId?: string;
}

const PaginationInfo = ({
  format = 'pages',
  itemsPluralName,
  testId,
  className,
  ...props
}: PaginationInfoProps) => {
  const [theme] = useTheme();

  const contextValue = useContext(PaginationContext);

  if (!contextValue) {
    return null;
  }

  const { offset, limit, total } = contextValue;

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  const startItem = offset + 1;
  const endItem = Math.min(offset + limit, total);

  const text = {
    pages: `Page ${currentPage} of ${totalPages}`,
    items: `${startItem}-${endItem} of ${total}${itemsPluralName ? ` ${itemsPluralName}` : ''}`,
  }[format];

  const baseStyle = css`
    margin: ${theme.margin.m24} 0;
    text-align: center;
    color: ${theme.color.text.secondary};
    font-family: ${theme.font.family.primary};
    font-size: ${theme.font.size.f16};
  `;

  const style = cx(NAME, baseStyle, className);

  return (
    <div
      className={style}
      data-testid={testId}
      aria-live='polite'
      aria-label={`Pagination info: ${text}`}
      {...props}
    >
      {text}
    </div>
  );
};

export default memo(PaginationInfo);
