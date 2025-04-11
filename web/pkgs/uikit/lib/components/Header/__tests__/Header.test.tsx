import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import Header from '../Header';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Header', () => {
  // Snapshot tests

  test('snapshot: variant=breadcrumbs', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Header
          variant='breadcrumbs'
          heading='LIDS'
          subheading='Lorem Ipsum Dolor Simet'
          name='Haley Holland'
          role='Super User'
          profileImageSrc='/img.jpg'
        />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: variant=avatar', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Header
          variant='avatar'
          heading='LIDS'
          subheading='Lorem Ipsum Dolor Simet'
          name='Haley Holland'
          role='Super User'
          profileImageSrc='/img.jpg'
        />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });
});
