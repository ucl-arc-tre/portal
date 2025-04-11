export type NumberButtonType = number | '...1' | '...2';

const getPaginationButtons = (
  currentPage: number,
  totalPages: number,
  maxNumberButtons: number
): NumberButtonType[] => {
  if (totalPages <= maxNumberButtons) {
    return Array.from(
      { length: totalPages },
      (_, i) => i + 1
    );
  }

  const pages: NumberButtonType[] = [];
  const numDisplayedPages = maxNumberButtons - 2; // Reserve space for first and last page
  const leftSide = Math.max(
    2,
    currentPage - Math.floor(numDisplayedPages / 2)
  );
  const rightSide = Math.min(
    totalPages - 1,
    leftSide + numDisplayedPages - 1
  );

  // Adjust leftSide if we're too close to the end
  const adjustedLeftSide = Math.max(
    2,
    rightSide - numDisplayedPages + 1
  );

  pages.push(1); // Always show first page

  if (adjustedLeftSide > 2) {
    pages.push('...1');
  }

  for (let i = adjustedLeftSide; i <= rightSide; i++) {
    pages.push(i);
  }

  if (rightSide < totalPages - 1) {
    pages.push('...2');
  }

  pages.push(totalPages); // Always show last page

  return pages;
};

export default getPaginationButtons;
