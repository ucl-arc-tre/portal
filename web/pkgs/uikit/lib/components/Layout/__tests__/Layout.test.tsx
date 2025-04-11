import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeContextProvider } from '../../../theme/useTheme';
import Layout from '../Layout';

describe('Layout', () => {
  // Snapshot tests

  test('Snapshot: no children', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Layout />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: with children', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Layout>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </Layout>
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  // Behaviour tests

  test('Can be found by default testId', () => {
    const defaultTestId = 'ucl-uikit-layout';
    render(
      <ThemeContextProvider>
        <Layout />
      </ThemeContextProvider>
    );
    expect(screen.getByTestId(defaultTestId)).toBeInTheDocument();
  });

  test('Can be found by testId', () => {
    render(
      <ThemeContextProvider>
        <Layout testId='test-id' />
      </ThemeContextProvider>
    );
    expect(screen.getByTestId('test-id')).toBeInTheDocument();
  });
});
