import {
  describe,
  test,
  expect,
  vi,
  afterEach,
} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import { ThemeContextProvider } from '../../../../../theme';
import DateField from '../DateField';

const customRender = (ui: React.ReactElement) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeContextProvider>
        {children}
      </ThemeContextProvider>
    ),
  });
};

describe('DateField', () => {
  // Run cleanup after each test
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  test('Renders without crashing', () => {
    const testId = 'abc';
    customRender(
      <DateField
        date={null}
        onChange={vi.fn()}
        testId={testId}
      />
    );
    const dateField = screen.getByTestId(
      testId + '-date-field'
    );
    expect(dateField).toBeInTheDocument();
  });

  test('Displays placeholder text when `date` prop is null', () => {
    const testId = 'abc';
    customRender(
      <DateField
        date={null}
        onChange={vi.fn()}
        testId={testId}
      />
    );
    const inputField = screen.getByTestId(
      testId + '-input'
    ) as HTMLInputElement;
    expect(inputField.placeholder).toBe('DD/MM/YYYY');
  });

  test('Displays the correct date values when a date is present', () => {
    const testId = 'abc';
    const date = new Date('2025-02-01');
    customRender(
      <DateField
        date={date}
        onChange={vi.fn()}
        testId={testId}
      />
    );
    const inputField = screen.getByTestId(
      testId + '-input'
    ) as HTMLInputElement;
    expect(inputField.value).toBe('01/02/2025');
  });

  test('Updates date value (from null)', () => {
    const testId = 'abc';
    const date = new Date('2025-02-01');
    const onChange = vi.fn();
    customRender(
      <DateField
        date={null}
        onChange={onChange}
        testId={testId}
      />
    );
    const inputField = screen.getByTestId(
      testId + '-input'
    ) as HTMLInputElement;

    fireEvent.change(inputField, {
      target: { value: '01/02/2025' },
    });
    fireEvent.keyDown(inputField, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(date);
  });

  test('Updates date value (from existing date)', () => {
    const testId = 'abc';
    const date = new Date('2025-01-01');
    const onChange = vi.fn();
    customRender(
      <DateField
        date={date}
        onChange={onChange}
        testId={testId}
      />
    );
    const inputField = screen.getByTestId(
      testId + '-input'
    ) as HTMLInputElement;

    fireEvent.change(inputField, {
      target: { value: '01/02/2025' },
    });
    fireEvent.keyDown(inputField, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(
      new Date('2025-02-01')
    );
  });

  test('Handles alternative date formats', () => {
    const testId = 'abc';
    const onChange = vi.fn();
    customRender(
      <DateField
        date={null}
        onChange={onChange}
        testId={testId}
      />
    );
    const inputField = screen.getByTestId(
      testId + '-input'
    ) as HTMLInputElement;

    // With 1 digit for day and month, and 2 digits for year
    fireEvent.change(inputField, {
      target: { value: '3/2/25' },
    });
    fireEvent.keyDown(inputField, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(
      new Date('2025-02-03')
    );

    // With hyphens
    fireEvent.change(inputField, {
      target: { value: '20-03-2026' },
    });
    fireEvent.keyDown(inputField, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(
      new Date('2026-03-20')
    );

    // With spaces
    fireEvent.change(inputField, {
      target: { value: '10 11 27' },
    });
    fireEvent.keyDown(inputField, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(
      new Date('2027-11-10')
    );
  });

  test('Resets date value on ESCAPE key press', () => {
    const testId = 'abc';
    const date = new Date('2025-01-01');
    const onChange = vi.fn();
    customRender(
      <DateField
        date={date}
        onChange={onChange}
        testId={testId}
      />
    );
    const inputField = screen.getByTestId(
      testId + '-input'
    ) as HTMLInputElement;

    fireEvent.change(inputField, {
      target: { value: '10/10/2026' },
    });
    fireEvent.keyDown(inputField, { key: 'Escape' });
    expect(inputField.value).toBe('01/01/2025');
  });

  // Any further tests can be added here
});
