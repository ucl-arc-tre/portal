import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeContextProvider } from '../../../theme/useTheme';
import Modal from '../Modal';

describe('Modal', () => {
  // Snapshot test

  test('snapshot: default', () => {
    const { container } = render(
      <ThemeContextProvider>
        <Modal />
      </ThemeContextProvider>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
