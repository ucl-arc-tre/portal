import {
  describe,
  test,
  expect,
  vi,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import { ThemeContextProvider } from '../../../theme';
import Datepicker from '../Datepicker';

const customRender = (ui: React.ReactElement) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeContextProvider>
        {children}
      </ThemeContextProvider>
    ),
  });
};

describe('Datepicker', () => {
  beforeAll(() => {
    // Snapshot tests will fail because the Calendar Grid includes styling for "today's date".
    // Therefore, we need to use Vitest to mock the current date.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-03-10')); // Arbitrary fixed date -- Alex's birthday :)
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  test('Snapshot: no date provided', () => {
    const renderResult = customRender(
      <Datepicker
        date={null}
        onDateChange={vi.fn()}
      />
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('Snapshot: date provided', () => {
    const renderResult = customRender(
      <Datepicker
        date={new Date('2025-02-04')}
        onDateChange={vi.fn()}
      />
    );
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('Snapshot: with :focus & date provided', () => {
    const testId = 'abc';
    const renderResult = customRender(
      <Datepicker
        date={new Date('2025-02-04')}
        onDateChange={vi.fn()}
        testId={testId}
      />
    );
    const dateField = screen.getByTestId(
      testId + '-date-field'
    );
    fireEvent.focus(dateField);
    expect(
      renderResult.container.firstChild
    ).toMatchSnapshot();
  });

  test('Renders without crashing', () => {
    const testId = 'abc';
    customRender(
      <Datepicker
        date={null}
        onDateChange={vi.fn()}
        testId={testId}
      />
    );
    const datepicker = screen.getByTestId(testId);
    expect(datepicker).toBeInTheDocument();
  });

  test('Calendar Menu appears on :focus', () => {
    const testId = 'abc';
    customRender(
      <Datepicker
        date={null}
        onDateChange={vi.fn()}
        testId={testId}
      />
    );
    let calendarMenu = screen.queryByTestId(
      testId + '-calendar-menu'
    );
    expect(calendarMenu).not.toBeInTheDocument();
    const dateField = screen.getByTestId(testId);
    fireEvent.focus(dateField);
    calendarMenu = screen.getByTestId(
      testId + '-calendar-menu'
    );
    expect(calendarMenu).toBeInTheDocument();
  });

  test('Calendar Menu disappears on :blur', () => {
    const testId = 'abc';
    customRender(
      <Datepicker
        date={null}
        onDateChange={vi.fn()}
        testId={testId}
      />
    );
    const dateField = screen.getByTestId(
      testId + '-date-field'
    );
    fireEvent.focus(dateField);
    let calendarMenu = screen.getByTestId(
      testId + '-calendar-menu'
    ) as HTMLElement | null;
    expect(calendarMenu).toBeInTheDocument();
    fireEvent.blur(dateField);
    calendarMenu = screen.queryByTestId(
      testId + '-calendar-menu'
    ) as HTMLElement | null;
    expect(calendarMenu).not.toBeInTheDocument();
  });

  // Additonal tests can be added here
});
