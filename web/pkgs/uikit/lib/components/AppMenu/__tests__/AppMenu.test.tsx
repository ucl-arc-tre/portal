import { describe, expect, test, beforeAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AppMenu from '../AppMenu';
import { ThemeContextProvider } from '../../../theme/useTheme';
import Icon from '../../Icon';

beforeAll(() => {
  globalThis.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query === '(min-width: 1056px)',
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

describe('AppMenu', () => {
  //snapshot
  test('snapshot: no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <AppMenu />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: testId prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <AppMenu testId='test1' />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('snapshot: defaultOpen prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <AppMenu defaultOpen>
          <AppMenu.Trigger>
            <Icon.Menu />
          </AppMenu.Trigger>
          <AppMenu.Content>
            <AppMenu.MenuItem>Menu Item 1</AppMenu.MenuItem>
            <AppMenu.Divider />
            <AppMenu.MenuItem>Menu Item 2</AppMenu.MenuItem>
          </AppMenu.Content>
        </AppMenu>
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  //interaction
  test('test ID: default', () => {
    render(
      <ThemeContextProvider>
        <AppMenu />
      </ThemeContextProvider>
    );
    const appMenu = screen.getByTestId('ucl-app-menu');
    expect(appMenu).toBeDefined();
  });

  test('menu button click reveals menu list', async () => {
    const user = userEvent.setup();

    render(
      <ThemeContextProvider>
        <AppMenu>
          <AppMenu.Trigger testId='menu-trigger'>
            <Icon.Menu />
          </AppMenu.Trigger>
          <AppMenu.Content testId='menu-content'>
            <AppMenu.MenuItem>Menu Item 1</AppMenu.MenuItem>
          </AppMenu.Content>
        </AppMenu>
      </ThemeContextProvider>
    );

    const appMenuButton = screen.getByTestId(
      'menu-trigger'
    ) as HTMLButtonElement;
    const appMenuContent = screen.getByTestId(
      'menu-content'
    ) as HTMLUListElement;

    const computedStylesBeforeClick = window.getComputedStyle(appMenuContent);
    expect(computedStylesBeforeClick.display).toBe('none');

    await user.click(appMenuButton);

    const computedStylesAfterClick = window.getComputedStyle(appMenuContent);
    expect(computedStylesAfterClick.display).toBe('block');
  });
});
