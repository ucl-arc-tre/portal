import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeContextProvider } from '../../../theme/useTheme';
import Heading from '../Heading';

describe('Heading', () => {
  // Snapshot tests

  test('snapshot: minimal props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Heading>This is a test</Heading>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: custom test id', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Heading testId='custom-test-id'>
          This is a test
        </Heading>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: level', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Heading level={1}>Level 1</Heading>
        <Heading level={2}>Level 2</Heading>
        <Heading level={3}>Level 3</Heading>
        <Heading level={4}>Level 4</Heading>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: no margins', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Heading margins={false}>No margins</Heading>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('Test ID: Default', () => {
    render(
      <ThemeContextProvider>
        <Heading>This is a test</Heading>
      </ThemeContextProvider>
    );
    const heading = screen.getByTestId('ucl-heading');
    expect(heading).toBeDefined();
  });

  test('Test ID: Custom', () => {
    render(
      <ThemeContextProvider>
        <Heading testId='custom-test-id'>
          This is a test
        </Heading>
      </ThemeContextProvider>
    );
    const heading = screen.getByTestId('custom-test-id');
    expect(heading).toBeDefined();
  });
});
