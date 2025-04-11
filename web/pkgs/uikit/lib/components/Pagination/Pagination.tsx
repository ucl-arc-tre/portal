import { HTMLAttributes, createContext } from 'react';
import { css, cx } from '@emotion/css';
import PaginationControls from './PaginationControls';
import PaginationInfo from './PaginationInfo';

export const NAME = 'ucl-uikit-pagination';

interface PaginationContextValue {
  offset: number;
  limit: number;
  total: number;
  onPageChange?: (page: number) => void;
}

export const PaginationContext = createContext<
  PaginationContextValue | undefined
>(undefined);

export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  offset: number;
  limit: number;
  total: number;
  onPageChange?: (newOffset: number) => void;
  testId?: string;
}

const Pagination = ({
  offset,
  limit,
  total,
  onPageChange,
  testId,
  className,
  children,
  ...props
}: PaginationProps) => {
  const contextValue: PaginationContextValue = {
    offset,
    limit,
    total,
    onPageChange,
  };

  const baseStyle = css`
    margin-left: auto;
    margin-right: auto;
  `;

  const style = cx(NAME, baseStyle, className);

  return (
    <PaginationContext.Provider value={contextValue}>
      <div
        data-testid={testId}
        className={style}
        {...props}
      >
        {children}
      </div>
    </PaginationContext.Provider>
  );
};

export interface PaginationSubComponents {
  Controls: typeof PaginationControls;
  Info: typeof PaginationInfo;
}

const PaginationWithSubComponents = Pagination as typeof Pagination &
  PaginationSubComponents;

PaginationWithSubComponents.Controls = PaginationControls;
PaginationWithSubComponents.Info = PaginationInfo;

export default PaginationWithSubComponents;
