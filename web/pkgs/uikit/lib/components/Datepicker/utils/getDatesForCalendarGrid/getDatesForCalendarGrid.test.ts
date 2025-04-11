import { describe, expect, test } from 'vitest';
import getDatesForCalendarGrid from './getDatesForCalendarGrid';

describe('getDatesForCalendarGrid', () => {
  test('Returns an array of Date objects', () => {
    const result = getDatesForCalendarGrid(new Date());
    expect(
      result.every((date) => date instanceof Date)
    ).toBe(true);
  });

  test('Throws an error if no date is provided', () => {
    // @ts-expect-error - Expected behaviour is an error to be thrown
    expect(() => getDatesForCalendarGrid()).toThrowError(
      'No date provided'
    );
    expect(() =>
      // @ts-expect-error - Expected behaviour is an error to be thrown
      getDatesForCalendarGrid(null)
    ).toThrowError('No date provided');
    expect(() =>
      // @ts-expect-error - Expected behaviour is an error to be thrown
      getDatesForCalendarGrid(undefined)
    ).toThrowError('No date provided');
    // @ts-expect-error - Expected behaviour is an error to be thrown
    expect(() => getDatesForCalendarGrid('')).toThrowError(
      'No date provided'
    );
    // @ts-expect-error - Expected behaviour is an error to be thrown
    expect(() => getDatesForCalendarGrid(0)).toThrowError(
      'No date provided'
    );
    expect(() =>
      // @ts-expect-error - Expected behaviour is an error to be thrown
      getDatesForCalendarGrid('1st of March')
    ).toThrowError('No date provided');
  });

  test('Total dates returned are always divisible by 7', () => {
    expect(
      getDatesForCalendarGrid(new Date(2025, 1, 1)).length %
        7
    ).toBe(0);
    expect(
      getDatesForCalendarGrid(new Date(2025, 2, 5)).length %
        7
    ).toBe(0);
    expect(
      getDatesForCalendarGrid(new Date(2025, 3, 15))
        .length % 7
    ).toBe(0);
    expect(
      getDatesForCalendarGrid(new Date(2025, 4, 20))
        .length % 7
    ).toBe(0);
    expect(
      getDatesForCalendarGrid(new Date(2025, 5, 25))
        .length % 7
    ).toBe(0);
    expect(
      getDatesForCalendarGrid(new Date(2025, 6, 30))
        .length % 7
    ).toBe(0);
    expect(
      getDatesForCalendarGrid(new Date(2025, 12, 0))
        .length % 7
    ).toBe(0);
  });

  test('If date is in Jan 2025, returns all dates in January 2024', () => {
    const date = new Date(2025, 0, 1);
    const result = getDatesForCalendarGrid(date);
    const janDates = [];
    for (let i = 1; i <= 31; i++)
      janDates.push(new Date(2025, 0, i));
    janDates.forEach((dateInJan) => {
      expect(result).toContainEqual(dateInJan);
    });
  });

  test('If date is in Jan 2025, returns 30th & 31st Dec 2024 at the start', () => {
    const date = new Date(2025, 0, 1);
    const result = getDatesForCalendarGrid(date);
    expect(result[0]).toEqual(new Date(2024, 11, 30));
    expect(result[1]).toEqual(new Date(2024, 11, 31));
  });

  test('If date is in Jan 2025, returns 1st & 2nd Feb 2025 at the end', () => {
    const date = new Date(2025, 0, 1);
    const result = getDatesForCalendarGrid(date);
    expect(result[result.length - 2]).toEqual(
      new Date(2025, 1, 1)
    );
    expect(result[result.length - 1]).toEqual(
      new Date(2025, 1, 2)
    );
  });

  test('If month starts on a Sunday, the total dates returned are divisible by 7', () => {
    const date = new Date(2025, 6, 1);
    const result = getDatesForCalendarGrid(date);
    expect(result.length % 7).toBe(0);
  });
  test('handles February in leap year correctly', () => {
    const leapYear = new Date(2024, 1, 1); // February 2024
    const result = getDatesForCalendarGrid(leapYear);
    const febDates = [];
    for (let i = 1; i <= 29; i++)
      febDates.push(new Date(2024, 1, i));
    febDates.forEach((date) => {
      expect(result).toContainEqual(date);
    });
  });

  test('handles February in non-leap year correctly', () => {
    const nonLeapYear = new Date(2025, 1, 1); // February 2025
    const result = getDatesForCalendarGrid(nonLeapYear);
    const febDates = [];
    for (let i = 1; i <= 28; i++)
      febDates.push(new Date(2025, 1, i));
    febDates.forEach((date) => {
      expect(result).toContainEqual(date);
    });
  });

  test('maintains chronological order of dates', () => {
    const date = new Date(2025, 3, 1); // April 2025
    const result = getDatesForCalendarGrid(date);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].getTime()).toBeGreaterThan(
        result[i - 1].getTime()
      );
    }
  });

  test('correctly handles months with 31 days', () => {
    const date = new Date(2025, 0, 1); // January 2025
    const result = getDatesForCalendarGrid(date);
    expect(
      result.filter((d) => d.getMonth() === 0).length
    ).toBe(31);
  });

  test('week always starts with Monday', () => {
    const dates = [
      new Date(2025, 0, 1), // January
      new Date(2025, 1, 1), // February
      new Date(2025, 2, 1), // March
      new Date(2025, 3, 1), // April
    ];

    dates.forEach((date) => {
      const result = getDatesForCalendarGrid(date);
      expect(result[0].getDay()).not.toBe(0); // Sunday
      expect(result[0].getDay()).toBeLessThanOrEqual(6);
      expect(result[6].getDay()).toBe(0); // First Sunday should be at index 6
    });
  });

  test('transition between years is handled correctly', () => {
    const date = new Date(2025, 11, 31); // December 31, 2025
    const result = getDatesForCalendarGrid(date);
    expect(result).toContainEqual(new Date(2026, 0, 1)); // January 1, 2026
    expect(result).toContainEqual(new Date(2025, 11, 31)); // December 31, 2025
  });
});
