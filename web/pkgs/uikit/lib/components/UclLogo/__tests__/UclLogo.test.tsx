import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import UclLogo from '../UclLogo';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('UclLogo', () => {
  // Snapshot tests

  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <UclLogo />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: testId prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <UclLogo testId='test123' />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });
});
