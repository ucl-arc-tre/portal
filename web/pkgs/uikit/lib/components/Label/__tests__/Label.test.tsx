import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Label from '../Label';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Label', () => {
  // Snapshot tests

  test('snapshot: Only required prop (text)', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Label>Name</Label>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: type prop with value of bold', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Label type='bold'>Name</Label>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: type prop with value of standard', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Label type='standard'>Name</Label>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: type prop with value of small', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Label type='small'>Name</Label>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: testId prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Label testId='test123'>Name</Label>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: className prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Label className='test-class-name'>Name</Label>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  // Interaction tests
  // Check Text
  test('text: label text value', () => {
    render(
      <ThemeContextProvider>
        <Label>Name</Label>
      </ThemeContextProvider>
    );
    const label = screen.getByText('Name');
    expect(label).toBeDefined();
  });

  // Default testId
  test('test ID: default', () => {
    render(
      <ThemeContextProvider>
        <Label>Name</Label>
      </ThemeContextProvider>
    );
    const input = screen.getByTestId('ucl-label');
    expect(input).toBeDefined();
  });

  // testId
  test('test ID: custom', () => {
    render(
      <ThemeContextProvider>
        <Label testId='custom-test-id'>Name</Label>
      </ThemeContextProvider>
    );

    const input = screen.getByTestId('custom-test-id');
    expect(input).toBeDefined();
  });
});
