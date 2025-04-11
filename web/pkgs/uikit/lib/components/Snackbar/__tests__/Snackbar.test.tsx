import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
// import '@testing-library/jest-dom';
import Snackbar from '../Snackbar';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Snackbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Snapshot tests

  test('snapshot: minimal props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Snackbar action='close'>Test snackbar</Snackbar>
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: custom test id', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Snackbar
          action='undo'
          testId='custom-test-id'
        >
          Test snackbar
        </Snackbar>
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  // Interaction tests

  test('Test ID: Default', () => {
    const defaultTestId = 'ucl-uikit-snackbar';
    render(
      <ThemeContextProvider>
        <Snackbar action='close'>Test snackbar</Snackbar>
      </ThemeContextProvider>
    );
    const snackbar = screen.getByTestId(defaultTestId);
    expect(snackbar).toBeDefined();
  });

  test('Test ID: Custom', () => {
    render(
      <ThemeContextProvider>
        <Snackbar
          action='undo'
          testId='custom-test-id'
        >
          Test snackbar
        </Snackbar>
      </ThemeContextProvider>
    );
    const customTestId = screen.getByTestId('custom-test-id');
    expect(customTestId).toBeDefined();
  });

  test('Close callback is called', () => {
    const onClose = vi.fn();
    render(
      <ThemeContextProvider>
        <Snackbar
          action='close'
          onClose={onClose}
        >
          Test snackbar
        </Snackbar>
      </ThemeContextProvider>
    );
    const closeButton = screen.getByTestId('ucl-uikit-snackbar-close-button');
    closeButton.click();
    expect(onClose).toHaveBeenCalled();
  });

  test('Undo callback is called', () => {
    const onUndo = vi.fn();
    render(
      <ThemeContextProvider>
        <Snackbar
          action='undo'
          onUndo={onUndo}
        >
          Test snackbar
        </Snackbar>
      </ThemeContextProvider>
    );
    const undoButton = screen.getByTestId('ucl-uikit-snackbar-undo-button');
    undoButton.click();
    expect(onUndo).toHaveBeenCalled();
  });

  test("Close callback cannot be called when action is 'undo'", () => {
    const onClose = vi.fn();
    render(
      <ThemeContextProvider>
        <Snackbar
          action='undo'
          onClose={onClose}
        >
          Test snackbar
        </Snackbar>
      </ThemeContextProvider>
    );
    const closeButton = screen.queryByTestId('ucl-uikit-snackbar-close-button');
    expect(closeButton).toBeNull();
    closeButton?.click();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("Undo callback cannot be called when action is 'close'", () => {
    const onUndo = vi.fn();
    render(
      <ThemeContextProvider>
        <Snackbar
          action='close'
          onUndo={onUndo}
        >
          Test snackbar
        </Snackbar>
      </ThemeContextProvider>
    );
    const undoButton = screen.queryByTestId('ucl-uikit-snackbar-undo-button');
    expect(undoButton).toBeNull();
    undoButton?.click();
    expect(onUndo).not.toHaveBeenCalled();
  });
});
