import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../Input';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Input', () => {
  // Snapshot tests

  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Input />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: value prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Input
          value='abc'
          onChange={() => {}}
        />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: placeholder prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Input placeholder='Type your value...' />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: testId prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Input testId='test123' />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  // Interaction tests

  test('test ID: default', () => {
    render(
      <ThemeContextProvider>
        <Input />
      </ThemeContextProvider>
    );
    const input = screen.getByTestId('ucl-input');
    expect(input).toBeDefined();
  });

  test('test ID: custom', () => {
    render(
      <ThemeContextProvider>
        <Input testId='custom-test-id' />
      </ThemeContextProvider>
    );
    const input = screen.getByTestId('custom-test-id');
    expect(input).toBeDefined();
  });

  test('text entry: uncontrolled', async () => {
    const user = userEvent.setup();
    render(
      <ThemeContextProvider>
        <Input />
      </ThemeContextProvider>
    );
    const input = screen.getByRole(
      'textbox'
    ) as HTMLInputElement;
    expect(input.value).toBe('');
    await user.type(input, 'a');
    expect(input.value).toBe('a');
    await user.type(input, 'b');
    expect(input.value).toBe('ab');
  });

  test('text entry: disabled', async () => {
    const user = userEvent.setup();
    render(
      <ThemeContextProvider>
        <Input disabled />
      </ThemeContextProvider>
    );
    const input = screen.getByRole(
      'textbox'
    ) as HTMLInputElement;
    expect(input.value).toBe('');
    await user.type(input, 'a');
    expect(input.value).toBe('');
  });
});
