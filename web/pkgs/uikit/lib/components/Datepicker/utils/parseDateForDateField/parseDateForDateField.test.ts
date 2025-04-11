import { describe, expect, test } from 'vitest';
import parseDateForDateField from './parseDateForDateField';

describe('parseDateForDateField', () => {
  test('Parses a valid slash-separated date string', () => {
    const dateString = '02/03/2025';
    const expectedDate = new Date('2025-03-02');
    expect(parseDateForDateField(dateString)).toEqual(
      expectedDate
    );
  });

  test('Parses a valid hyphen-separated date string', () => {
    const dateString = '01-02-2025';
    const expectedDate = new Date('2025-02-01');
    expect(parseDateForDateField(dateString)).toEqual(
      expectedDate
    );
  });

  test('Parses a valid space-separated date string', () => {
    const dateString = '10 11 2025';
    const expectedDate = new Date('2025-11-10');
    expect(parseDateForDateField(dateString)).toEqual(
      expectedDate
    );
  });

  test('Parses a valid date string with leading/trailing whitespace', () => {
    const dateString = '    11-12-2025    ';
    const expectedDate = new Date('2025-12-11');
    expect(parseDateForDateField(dateString)).toEqual(
      expectedDate
    );
  });

  test('Invalid date string returns null', () => {
    const dateString = '1234567890';
    expect(parseDateForDateField(dateString)).toBeNull();
  });
});
