import { HTMLAttributes, memo, useContext, useCallback } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import { PaginationContext } from './Pagination';
import Button from '../Button';
import getPaginationButtons from './getPaginationButtons';

export const NAME = 'ucl-ukit-pagination__controls';
export const DEFAULT_MAX_BUTTONS = 9;

export interface PaginationControlsProps
  extends HTMLAttributes<HTMLDivElement> {
  maxNumberButtons?: number;
  testId?: string;
}

const PaginationControls = ({
  maxNumberButtons = DEFAULT_MAX_BUTTONS,
  testId = NAME,
  className,
}: PaginationControlsProps) => {
  const [theme] = useTheme();

  const contextValue = useContext(PaginationContext);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (contextValue) {
        const { limit, onPageChange } = contextValue;
        const newOffset = (newPage - 1) * limit;
        if (onPageChange) {
          onPageChange(newOffset);
        }
      }
    },
    [contextValue]
  );

  if (!contextValue) {
    return null;
  }

  const { offset, limit, total } = contextValue;

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const paginationButtons = getPaginationButtons(
    currentPage,
    totalPages,
    maxNumberButtons
  );

  const baseStyle = css``;

  const style = cx(NAME, baseStyle, className);

  const listStyle = css`
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${theme.margin.m8};
    list-style: none;
  `;

  const previousButtonStyle = css`
    margin-right: ${theme.margin.m16};
  `;

  const nextButtonStyle = css`
    margin-left: ${theme.margin.m16};
  `;

  const pageNumberButtonBaseStyle = css`
    height: 48px;
    min-width: 48px;
    padding: 0;
  `;

  const pageNumberButtonStyle = cx(
    pageNumberButtonBaseStyle,
    css`
      border: none;
      color: ${theme.color.text.secondary};
    `
  );

  const currentPageNumberButtonStyle = cx(
    pageNumberButtonBaseStyle,
    css`
      color: ${theme.color.interaction.blue70};
      border-color: ${theme.color.interaction.blue70};
    `
  );

  const buttonNumberLabelStyle = css`
    padding: 0 ${theme.padding.p8};
  `;

  return (
    <nav
      className={style}
      aria-label='Pagination'
      data-testid={testId}
    >
      <ul className={listStyle}>
        <li>
          <Button
            className={previousButtonStyle}
            variant='tertiary'
            aria-label='Go to previous page'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
        </li>

        {paginationButtons.map((page) => (
          <li key={page}>
            {page === '...1' || page === '...2' ? (
              <span aria-hidden>...</span>
            ) : (
              <>
                {page !== currentPage && (
                  <Button
                    className={pageNumberButtonStyle}
                    variant='secondary'
                    aria-label={`Page ${page}`}
                    onClick={() => handlePageChange(page)}
                  >
                    <span className={buttonNumberLabelStyle}>{page}</span>
                  </Button>
                )}
                {page === currentPage && (
                  <Button
                    className={currentPageNumberButtonStyle}
                    variant='secondary'
                    aria-label={`Page ${page}, current page`}
                    aria-current='page'
                    aria-setsize={totalPages}
                    aria-posinset={page}
                    disabled
                    onClick={() => handlePageChange(page)}
                  >
                    <span className={buttonNumberLabelStyle}>{page}</span>
                  </Button>
                )}
              </>
            )}
          </li>
        ))}

        <li>
          <Button
            className={nextButtonStyle}
            variant='tertiary'
            aria-label='Go to next page'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </li>
      </ul>
    </nav>
  );
};

export default memo(PaginationControls);
