import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tooltip from '../Tooltip';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Tooltip', () => {
  // Snapshot tests

  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Tooltip>test</Tooltip>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: testId prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Tooltip testId='test123'> Info Tooltip </Tooltip>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  // // Interaction tests

  test('test ID: default', () => {
    render(
      <ThemeContextProvider>
        <Tooltip> Info Tooltip </Tooltip>
      </ThemeContextProvider>
    );
    const tooltip = screen.getByTestId('ucl-tooltip');
    expect(tooltip).toBeDefined();
  });

  test('test ID: custom', () => {
    render(
      <ThemeContextProvider>
        <Tooltip testId='custom-test-id'>
          {' '}
          Info Tooltip{' '}
        </Tooltip>
      </ThemeContextProvider>
    );
    const tooltip = screen.getByTestId('custom-test-id');
    expect(tooltip).toBeDefined();
  });
});
