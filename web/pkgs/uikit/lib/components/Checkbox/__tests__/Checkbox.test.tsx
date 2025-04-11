import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeContextProvider } from '../../../theme/useTheme';
import Checkbox from '../Checkbox';

describe('Checkbox', () => {
  // Snapshot tests

  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Checkbox />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: checked prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Checkbox
          checked
          onChange={() => {}}
        />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: indeterminate prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Checkbox
          indeterminate
          onChange={() => {}}
        />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: testId prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Checkbox testId='test123' />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  // Interaction tests

  test('test ID: default', () => {
    render(
      <ThemeContextProvider>
        <Checkbox />
      </ThemeContextProvider>
    );
    const checkbox = screen.getByTestId('ucl-uikit-checkbox');
    expect(checkbox).toBeDefined();
  });

  test('test ID: custom', () => {
    render(
      <ThemeContextProvider>
        <Checkbox testId='custom-test-id' />
      </ThemeContextProvider>
    );
    const checkbox = screen.getByTestId('custom-test-id');
    expect(checkbox).toBeDefined();
  });

  test('click: uncontrolled', async () => {
    const user = userEvent.setup();
    render(
      <ThemeContextProvider>
        <Checkbox />
      </ThemeContextProvider>
    );
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  test('click: disabled', async () => {
    const user = userEvent.setup();
    render(
      <ThemeContextProvider>
        <Checkbox disabled />
      </ThemeContextProvider>
    );
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await user.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });
});
