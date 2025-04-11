import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import Icon from '../Icon';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Icon', () => {
  // Snapshot tests

  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Icon.Check />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: size prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Icon.Check size={32} />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: className prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Icon.Check className='a-class-name' />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });
});
