import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeContextProvider } from '../../../theme/useTheme';
import Alert from '../Alert';

describe('Alert', () => {
  // Snapshot tests

  test('snapshot: type=info, no title', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Alert type='info'>
          <Alert.Message>
            This is an informational alert.
          </Alert.Message>
        </Alert>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: type=success', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Alert type='success'>
          <Alert.Title>Success</Alert.Title>
          <Alert.Message>
            Your operation completed successfully.
          </Alert.Message>
        </Alert>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: type=warning', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Alert type='warning'>
          <Alert.Title>Warning</Alert.Title>
          <Alert.Message>
            This operation may have unintended consequences.
          </Alert.Message>
        </Alert>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: type=error', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Alert type='error'>
          <Alert.Title>Error Alert</Alert.Title>
          <Alert.Message>
            The operation failed.
          </Alert.Message>
        </Alert>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });
});
