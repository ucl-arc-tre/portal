import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Textarea from '../Textarea';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Textarea', () => {
  // Snapshot tests

  test('snapshot: minimal props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Textarea />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: custom test id', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Textarea testId='custom-test-id' />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: Placeholder', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Textarea placeholder='test' />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: Disabled', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Textarea disabled />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  // Interaction tests

  test('Test ID: Default', () => {
    render(
      <ThemeContextProvider>
        <Textarea />
      </ThemeContextProvider>
    );
    const textarea = screen.getByTestId('ucl-textarea');
    expect(textarea).toBeDefined();
  });

  test('Test ID: Custom', () => {
    render(
      <ThemeContextProvider>
        <Textarea testId='custom-test-id' />
      </ThemeContextProvider>
    );
    const customTestId = screen.getByTestId(
      'custom-test-id'
    );
    expect(customTestId).toBeDefined();
  });

  test('Placeholder', () => {
    render(
      <ThemeContextProvider>
        <Textarea placeholder='Test' />
      </ThemeContextProvider>
    );
    const textarea = screen.getByTestId(
      'ucl-textarea'
    ) as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe('Test');
  });

  test('Typing in Textarea', async () => {
    const user = userEvent.setup();
    render(
      <ThemeContextProvider>
        <Textarea />
      </ThemeContextProvider>
    );
    const textarea = screen.getByTestId(
      'ucl-textarea'
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
    await user.type(textarea, 'a');
    expect(textarea.value).toBe('a');
    await user.type(textarea, 'b');
    expect(textarea.value).toBe('ab');
  });

  test('Typing in Textarea: Disabled', async () => {
    const user = userEvent.setup();
    render(
      <ThemeContextProvider>
        <Textarea disabled />
      </ThemeContextProvider>
    );
    const textarea = screen.getByTestId(
      'ucl-textarea'
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
    await user.type(textarea, 'a');
    expect(textarea.value).toBe('');
    await user.type(textarea, 'b');
    expect(textarea.value).toBe('');
  });
});
