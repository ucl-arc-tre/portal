import { describe, expect, test, vitest } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Button', () => {
  // Snapshot tests

  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Button />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: variant prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Button variant='secondary' />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: testId prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Button testId='test123' />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  // Interaction tests

  test('test ID: default', () => {
    render(
      <ThemeContextProvider>
        <Button />
      </ThemeContextProvider>
    );
    const button = screen.getByTestId('ucl-uikit-button');
    expect(button).toBeDefined();
  });

  test('test ID: custom', () => {
    render(
      <ThemeContextProvider>
        <Button testId='custom-test-id' />
      </ThemeContextProvider>
    );
    const button = screen.getByTestId('custom-test-id');
    expect(button).toBeDefined();
  });

  test('button click', async () => {
    const user = userEvent.setup();
    const testClick = vitest.fn();
    render(
      <ThemeContextProvider>
        <Button onClick={testClick} />
      </ThemeContextProvider>
    );

    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(testClick).not.toBeCalled();
    await user.click(button);
    expect(testClick).toBeCalled();
  });

  test('button click disabled', async () => {
    const user = userEvent.setup();
    const testClick = vitest.fn();
    render(
      <ThemeContextProvider>
        <Button
          onClick={testClick}
          disabled
        />
      </ThemeContextProvider>
    );

    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(testClick).not.toBeCalled();
    await user.click(button);
    expect(testClick).not.toBeCalled();
  });
});
