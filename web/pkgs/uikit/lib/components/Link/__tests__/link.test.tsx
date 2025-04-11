import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Link from '../Link';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Link', () => {
  // Snapshot tests

  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Link>test</Link>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: testId prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Link testId='test123'> testidlink </Link>
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
        <Link> testidlink </Link>
      </ThemeContextProvider>
    );
    const link = screen.getByTestId('ucl-link');
    expect(link).toBeDefined();
  });

  test('test ID: custom', () => {
    render(
      <ThemeContextProvider>
        <Link testId='custom-test-id'> testidlink </Link>
      </ThemeContextProvider>
    );
    const link = screen.getByTestId('custom-test-id');
    expect(link).toBeDefined();
  });

  test('href value', async () => {
    render(
      <ThemeContextProvider>
        <Link href='/testlink'>linktext</Link>
      </ThemeContextProvider>
    );
    const link = screen.getByRole(
      'link'
    ) as HTMLAnchorElement;
    expect(link.textContent).toBe('linktext');
    expect(link.href).toBe(
      'http://localhost:3000/testlink'
    );
  });
});
