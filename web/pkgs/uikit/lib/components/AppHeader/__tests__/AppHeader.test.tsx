import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import AppHeader from '../AppHeader';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('AppHeader', () => {
  // Snapshot tests

  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <AppHeader />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });
});
