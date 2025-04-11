import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Divider from '../Divider';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Divider', () => {
  test('renders a divider', () => {
    render(
      <ThemeContextProvider>
        <Divider testId='divider' />
      </ThemeContextProvider>
    );

    const divider = screen.getByTestId('divider');

    expect(divider).toBeInTheDocument();
  });

  test('renders a divider with custom class', () => {
    render(
      <ThemeContextProvider>
        <Divider
          testId='divider'
          className='custom-class'
        />
      </ThemeContextProvider>
    );

    const divider = screen.getByTestId('divider');

    expect(divider).toHaveClass('custom-class');
  });
});
