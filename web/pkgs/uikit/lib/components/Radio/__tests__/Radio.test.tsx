import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeContextProvider } from '../../../theme/useTheme';
import Radio from '../Radio';

describe('Radio', () => {
  // Snapshot tests

  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Radio />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: checked prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Radio
          checked
          onChange={() => {}}
        />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: testId prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Radio testId='test123' />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  // Interaction tests

  test('test ID: default', () => {
    render(
      <ThemeContextProvider>
        <Radio />
      </ThemeContextProvider>
    );
    const checkbox = screen.getByTestId('ucl-uikit-radio');
    expect(checkbox).toBeDefined();
  });

  test('test ID: custom', () => {
    render(
      <ThemeContextProvider>
        <Radio testId='custom-test-id' />
      </ThemeContextProvider>
    );
    const checkbox = screen.getByTestId('custom-test-id');
    expect(checkbox).toBeDefined();
  });

  test('click: uncontrolled', async () => {
    const user = userEvent.setup();
    render(
      <ThemeContextProvider>
        <Radio />
      </ThemeContextProvider>
    );
    const checkbox = screen.getByRole('radio') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  test('click: disabled', async () => {
    const user = userEvent.setup();
    render(
      <ThemeContextProvider>
        <Radio disabled />
      </ThemeContextProvider>
    );
    const checkbox = screen.getByRole('radio') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await user.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });
});
