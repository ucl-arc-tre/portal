import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Blanket from '../Blanket';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('<Blanket> Component', () => {
  // Snapshot test
  test('matches snapshot with no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Blanket />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  // Interaction test: Click on Blanket to toggle visibility
  // test('toggles visibility on click', async () => {
  //     const user = userEvent.setup();
  //     render(
  //         <ThemeContextProvider>
  //             <Blanket testId="ucl-blanket" />
  //         </ThemeContextProvider>
  //     );

  //     const blanket = screen.getByTestId('ucl-blanket');
  //     expect(blanket).toBeInTheDocument();

  //     const computedStylesBeforeClick = window.getComputedStyle(blanket);
  //     expect(computedStylesBeforeClick.visibility).toBe('visible');

  //     await user.click(blanket);

  //     const computedStylesAfterClick = window.getComputedStyle(blanket);
  //     expect(computedStylesAfterClick.visibility).toBe('hidden');
  // });

  // Test for custom props
  test('renders with custom className', () => {
    const className = 'custom-blanket';
    render(
      <ThemeContextProvider>
        <Blanket className={className} />
      </ThemeContextProvider>
    );

    const blanket = screen.getByTestId('ucl-blanket');
    expect(blanket).toHaveClass(className);
  });
});
