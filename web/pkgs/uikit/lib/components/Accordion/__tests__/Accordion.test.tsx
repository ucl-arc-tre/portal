import { describe, expect, test } from 'vitest';
import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import Accordion from '../Accordion';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Accordion', () => {
  // Snapshot tests

  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Accordion>
          <Accordion.Heading>Heading</Accordion.Heading>
          <Accordion.Panel>Panel Content</Accordion.Panel>
        </Accordion>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: testId prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Accordion testId='abc'>
          <Accordion.Heading>Heading</Accordion.Heading>
          <Accordion.Panel>Panel Content</Accordion.Panel>
        </Accordion>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  // Interaction tests

  test('should open and close the accordion', () => {
    render(
      <ThemeContextProvider>
        <Accordion>
          <Accordion.Heading>Heading</Accordion.Heading>
          <Accordion.Panel>Panel Content</Accordion.Panel>
        </Accordion>
      </ThemeContextProvider>
    );

    const heading = screen.getByText('Heading');
    expect(screen.queryByText('Panel Content')).toBeNull();

    fireEvent.click(heading);
    expect(
      screen.getByText('Panel Content')
    ).toBeInTheDocument();

    fireEvent.click(heading);
    expect(screen.queryByText('Panel Content')).toBeNull();
  });
});
