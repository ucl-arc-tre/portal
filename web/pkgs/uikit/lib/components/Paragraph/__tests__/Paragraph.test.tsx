import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Paragraph from '../Paragraph';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Paragraph', () => {
  // Snapshot tests

  test('snapshot: minimal props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Paragraph>This is a test</Paragraph>
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: custom test id', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Paragraph testId='custom-test-id'>This is a test</Paragraph>
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: size', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Paragraph size='standfirst'>standfirst</Paragraph>
        <Paragraph size='body'>body</Paragraph>
        <Paragraph size='small'>small</Paragraph>
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: emphasis', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Paragraph emphasis='high'>high emphasis</Paragraph>
        <Paragraph emphasis='medium'>medium emphasis</Paragraph>
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: no margins', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Paragraph margins={false}>no margins</Paragraph>
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Test ID: Default', () => {
    render(
      <ThemeContextProvider>
        <Paragraph>This is a test</Paragraph>
      </ThemeContextProvider>
    );
    const paragraph = screen.getByTestId('ucl-uikit-paragrah');
    expect(paragraph).toBeDefined();
  });

  test('Test ID: Custom', () => {
    render(
      <ThemeContextProvider>
        <Paragraph testId='custom-test-id'>This is a test</Paragraph>
      </ThemeContextProvider>
    );
    const paragraph = screen.getByTestId('custom-test-id');
    expect(paragraph).toBeDefined();
  });
});
