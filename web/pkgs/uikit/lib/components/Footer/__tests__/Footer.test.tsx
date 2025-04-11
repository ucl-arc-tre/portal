import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import Footer from '../Footer';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Footer', () => {
  // Snapshot tests

  test('snapshot: no nav links', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Footer />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: footer links provided', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Footer
          disclaimer='https://dictionary.cambridge.org/dictionary/english/disclaimer'
          freedomOfInformation='https://www.legislation.gov.uk/ukpga/2000/36/contents'
          accessibility='https://developer.mozilla.org/en-US/docs/Web/Accessibility'
          cookies='https://en.wikipedia.org/wiki/HTTP_cookie'
          privacy='https://dictionary.cambridge.org/dictionary/english/privacy'
          slaveryStatement='https://modern-slavery-statement-registry.service.gov.uk/'
        />
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: nav links', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Footer>
          <Footer.Column heading='Category 1'>
            <Footer.NavLink href='#'>Item 1</Footer.NavLink>
            <Footer.NavLink href='#'>Item 2</Footer.NavLink>
          </Footer.Column>
          <Footer.Column heading='Category 2'>
            <Footer.NavLink href='#'>Item 1</Footer.NavLink>
            <Footer.NavLink href='#'>Item 2</Footer.NavLink>
          </Footer.Column>
        </Footer>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });
});
