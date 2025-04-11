import { css } from '@emotion/css';
import { Icon } from '../../..';
import { useTheme } from '../../../../theme';
import { useState, useRef, useEffect } from 'react';
import { parseDate } from '../../utils';

interface DateFieldProps {
  date: Date | null | undefined;
  onChange: (date: Date | null | undefined) => void;
  testId?: string;
}

const DateField = ({
  date,
  onChange,
  testId,
}: DateFieldProps) => {
  const [theme] = useTheme();

  // Derived props (tidier than using `date?.getDate()`, etc, everywhere.)
  const day =
    date?.getDate().toString().padStart(2, '0') ?? '';
  const month = date
    ? (date.getMonth() + 1).toString().padStart(2, '0')
    : '';
  const year = date?.getFullYear().toString() ?? '';

  const [displayDate, setDisplayDate] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Format: DD/MM/YYYY
    setDisplayDate(date ? `${day}/${month}/${year}` : '');
  }, [date, day, month, year]);

  /**
   * Handles the change event for the date input field.
   *
   * This function ensures that only valid characters for a date are accepted
   * in the input field. The accepted characters include digits (0-9), slashes (/),
   * spaces, and hyphens (-). If the input contains any other characters, the function
   * will not update the display date.
   *
   * @param event - The change event triggered by the input field.
   */
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Accepted characters: 0-9, /, space, hyphen
    const regex = new RegExp('^[0123456789\\/ \\-]*$');
    if (!regex.test(event.target.value)) return;

    setDisplayDate(event.target.value);
  };

  const resetDate = () => {
    setDisplayDate(date ? `${day}/${month}/${year}` : '');
  };

  const handleParseDate = () => {
    const parsedDate = parseDate(displayDate);
    if (parsedDate) onChange(parsedDate);
    else resetDate();
  };

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key === 'Enter') handleParseDate();
    else if (event.key === 'Escape') resetDate();
  };

  const handleKeyDownEventPropagation = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    // Prevent event bubbling any further, so arrow keys presses don't affect `<CalendarGrid>`
    event.stopPropagation();
  };

  const containerStyle = css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 200px;
    height: 48px;
    padding: 0 16px;
    border: 1px solid ${theme.color.neutral.grey60};
    color: ${theme.color.neutral.black};
    background-color: ${theme.color.neutral.white};
    cursor: pointer;

    &:focus-visible {
      outline: none;
      box-shadow: ${theme.boxShadow.focus};
    }
  `;

  const inputStyle = css`
    width: 150px;
    font-family: ${theme.font.family.primary};
    font-size: 16px;
    text-align: left;
    border: none;
    padding: 6px;
    letter-spacing: 1px;
    color: ${theme.color.text.primary};
    caret-color: ${theme.color.text.primary};

    &::placeholder {
      color: ${theme.color.neutral.grey40};
    }

    &::selection {
      background-color: ${theme.color.neutral.grey60};
      color: ${theme.color.neutral.white};
    }

    &:focus {
      outline: none;
      background-color: ${theme.color.interaction.blue10};
    }
  `;

  return (
    <div
      className={containerStyle}
      role='group'
      aria-label='Date input'
      onBlur={handleParseDate}
      onClick={() => inputRef.current?.focus()}
      data-testid={testId + '-date-field'}
    >
      <div onKeyDown={handleKeyDownEventPropagation}>
        <input
          className={inputStyle}
          value={displayDate}
          placeholder='DD/MM/YYYY'
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          type='text'
          inputMode='numeric'
          ref={inputRef}
          aria-label='Date'
          data-testid={testId + '-input'}
        />
      </div>
      <Icon.Calendar
        onClick={handleParseDate}
        data-testid={testId + '-calendar-icon'}
      />
    </div>
  );
};

export default DateField;
