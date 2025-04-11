import { describe, expect, test } from 'vitest';
import extractInitials from './extractInitials';

describe('extractInitials', () => {
  test('Returns a string from a string', () => {
    const result = extractInitials('Bob Ross');
    expect(typeof result).toBe('string');
  });

  test('Returns a string from an empty string', () => {
    const result = extractInitials('');
    expect(typeof result).toBe('string');
  });

  test('Returns an empty string from null or undefined', () => {
    // @ts-expect-error - Expected behaviour is a string to be returned
    const result = extractInitials(null);
    expect(typeof result).toBe('string');
    // @ts-expect-error - Expected behaviour is a string to be returned
    const result2 = extractInitials(undefined);
    expect(typeof result2).toBe('string');
  });

  test("Returns A B from 'Alice Bobbington'", () => {
    const result = extractInitials('Alice Bobbington');
    expect(result).toBe('AB');
  });

  test("Returns A from 'Alice'", () => {
    const result = extractInitials('Alice');
    expect(result).toBe('A');
  });

  test("Returns A C from 'Alice Jane Carter'", () => {
    const result = extractInitials('Alice Jane Carter');
    expect(result).toBe('AC');
  });

  test('Returns X Y from Xavier Jo Bob Billy Dave Carter Yahtzee', () => {
    const result = extractInitials('Xavier Jo Bob Billy Dave Carter Yahtzee');
    expect(result).toBe('XY');
  });

  test('Can handle leading and trailing spaces', () => {
    const result = extractInitials('  Jeff Gonzo  ');
    expect(result).toBe('JG');
  });

  test('Can handle lowercase names', () => {
    const result = extractInitials('keith runway');
    expect(result).toBe('KR');
  });

  test('Can handle uppercase names', () => {
    const result = extractInitials('JIMMY BONES');
    expect(result).toBe('JB');
  });

  test('Returns an empty string from 123', () => {
    // @ts-expect-error - Expected behaviour is a string to be returned
    const result = extractInitials(123);
    console.log(result);
    expect(result).toBe('');
  });
});
