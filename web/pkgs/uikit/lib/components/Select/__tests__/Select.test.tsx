import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import Select from '../Select';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Select', () => {
  // Snapshot tests

  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Select>
          <option>Option 1</option>
          <option>Option 2</option>
          <option>Option 3</option>
          <option>Option 4</option>
        </Select>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: disabled', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Select disabled>
          <option>Option 1</option>
          <option>Option 2</option>
          <option>Option 3</option>
          <option>Option 4</option>
        </Select>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });
});
