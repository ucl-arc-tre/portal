import { describe, it, expect } from 'vitest';
import getPaginationButtons from '../getPaginationButtons'; // Adjust import path as needed

describe('getPaginationButtons', () => {
  it('should return all page numbers when totalPages <= maxNumberButtons', () => {
    expect(getPaginationButtons(1, 5, 7)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(getPaginationButtons(3, 7, 7)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(getPaginationButtons(7, 7, 10)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it('should handle when currentPage is at the beginning', () => {
    // maxNumberButtons = 7, so we show 5 page numbers plus first and last
    expect(getPaginationButtons(1, 20, 6)).toEqual([
      1,
      2,
      3,
      4,
      5,
      '...2',
      20,
    ]);
    expect(getPaginationButtons(2, 20, 6)).toEqual([
      1,
      2,
      3,
      4,
      5,
      '...2',
      20,
    ]);
    expect(getPaginationButtons(3, 20, 6)).toEqual([
      1,
      2,
      3,
      4,
      5,
      '...2',
      20,
    ]);
  });

  it('should not show ellipsis when pages are adjacent', () => {
    // When we're at the beginning
    expect(getPaginationButtons(3, 10, 6)).toEqual([
      1,
      2,
      3,
      4,
      5,
      '...2',
      10,
    ]);

    // When we're at the end
    expect(getPaginationButtons(8, 10, 6)).toEqual([
      1,
      '...1',
      6,
      7,
      8,
      9,
      10,
    ]);
  });

  it('should handle cases where all pages fit with maxNumberButtons', () => {
    // When we have exactly enough space for all needed numbers
    expect(getPaginationButtons(5, 7, 7)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it('should return correct results for single page', () => {
    expect(getPaginationButtons(1, 1, 5)).toEqual([1]);
  });

  // Additional test to verify adjustedLeftSide calculation
  it('should correctly adjust leftSide when close to the end', () => {
    // This tests the "Adjust leftSide if we're too close to the end" logic
    expect(getPaginationButtons(15, 20, 5)).toEqual([
      1,
      '...1',
      14,
      15,
      16,
      '...2',
      20,
    ]);
  });
});
