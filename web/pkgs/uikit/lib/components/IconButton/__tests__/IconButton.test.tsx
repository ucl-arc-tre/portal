import { describe, expect, test, vitest } from 'vitest';
import { render, screen } from '@testing-library/react';
import IconButton from '../IconButton';
import { ThemeContextProvider } from '../../../theme/useTheme';
import { Icon } from '../../';

describe('IconButton', () => {
  // Snapshot tests

  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <IconButton>
          <Icon.Check />
        </IconButton>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: testId prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <IconButton testId='abc'>
          <Icon.Check />
        </IconButton>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: disabled prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <IconButton disabled>
          <Icon.Check />
        </IconButton>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  // Interaction tests

  test('click', async () => {
    const testClick = vitest.fn();
    render(
      <ThemeContextProvider>
        <IconButton onClick={testClick}>
          <Icon.Check />
        </IconButton>
      </ThemeContextProvider>
    );
    const iconButton = screen.getByRole(
      'button'
    ) as HTMLButtonElement;
    expect(testClick).not.toBeCalled();
    await iconButton.click();
    expect(testClick).toBeCalled();
  });

  // TODO: test hover, focus, active styles
});
