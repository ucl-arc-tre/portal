import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Breadcrumbs from '../Breadcrumbs';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Breadcrumbs', () => {
  // Snapshot tests

  test('Snapshot: No props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Breadcrumbs>
          <Breadcrumbs.Breadcrumb uri='/'>
            Home
          </Breadcrumbs.Breadcrumb>
          <Breadcrumbs.Breadcrumb uri='/showcase'>
            Timetable
          </Breadcrumbs.Breadcrumb>
          <Breadcrumbs.Breadcrumb uri='/showcase/breadcrumbs'>
            Personal
          </Breadcrumbs.Breadcrumb>
        </Breadcrumbs>
      </ThemeContextProvider>
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('snapshot: Custom Test ID', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Breadcrumbs testId='custom-testid'>
          <Breadcrumbs.Breadcrumb
            testId='custom-testid-1'
            uri='/'
          >
            Home
          </Breadcrumbs.Breadcrumb>
          <Breadcrumbs.Breadcrumb
            testId='custom-testid-2'
            uri='/showcase'
          >
            Timetable
          </Breadcrumbs.Breadcrumb>
          <Breadcrumbs.Breadcrumb
            testId='custom-testid-3'
            uri='/showcase/breadcrumbs'
          >
            Personal
          </Breadcrumbs.Breadcrumb>
        </Breadcrumbs>
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
        <Breadcrumbs>
          <Breadcrumbs.Breadcrumb uri='/'>
            Home
          </Breadcrumbs.Breadcrumb>
          <Breadcrumbs.Breadcrumb uri='/showcase'>
            Timetable
          </Breadcrumbs.Breadcrumb>
          <Breadcrumbs.Breadcrumb uri='/showcase/breadcrumbs'>
            Personal
          </Breadcrumbs.Breadcrumb>
        </Breadcrumbs>
      </ThemeContextProvider>
    );
    const breadcrumbs = screen.getByTestId(
      'ucl-timetable-breadcrumbs'
    );
    const breadcrumb = screen.getAllByTestId(
      'ucl-timetable-breadcrumb'
    );
    expect(breadcrumbs).toBeDefined();
    expect(breadcrumb).toBeDefined();
  });

  test('Test ID: Custom', () => {
    render(
      <ThemeContextProvider>
        <Breadcrumbs testId='custom-testid'>
          <Breadcrumbs.Breadcrumb
            testId='custom-testid-1'
            uri='/'
          >
            Home
          </Breadcrumbs.Breadcrumb>
          <Breadcrumbs.Breadcrumb
            testId='custom-testid-2'
            uri='/showcase'
          >
            Timetable
          </Breadcrumbs.Breadcrumb>
          <Breadcrumbs.Breadcrumb
            testId='custom-testid-3'
            uri='/showcase/breadcrumbs'
          >
            Personal
          </Breadcrumbs.Breadcrumb>
        </Breadcrumbs>
      </ThemeContextProvider>
    );
    const breadcrumbs = screen.getByTestId('custom-testid');
    const breadcrumb1 = screen.getByTestId(
      'custom-testid-1'
    );
    const breadcrumb2 = screen.getByTestId(
      'custom-testid-2'
    );
    const breadcrumb3 = screen.getByTestId(
      'custom-testid-3'
    );
    expect(breadcrumbs).toBeDefined();
    expect(breadcrumb1).toBeDefined();
    expect(breadcrumb2).toBeDefined();
    expect(breadcrumb3).toBeDefined();
  });
});
