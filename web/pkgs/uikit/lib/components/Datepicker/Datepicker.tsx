import {
  useState,
  useRef,
  memo,
  InputHTMLAttributes,
} from 'react';
import { css, cx } from '@emotion/css';
import {
  Native,
  DateField,
  CalendarMenu,
} from './subcomponents';
import { useTheme } from '../../theme';

export const NAME = 'ucl-datepicker';

export interface DatepickerProps
  extends InputHTMLAttributes<HTMLInputElement> {
  date: Date | null | undefined;
  minDate?: Date | null | undefined;
  maxDate?: Date | null | undefined;
  onDateChange: (date: Date | null | undefined) => void;
  native?: boolean;
  testId?: string;
}

const Datepicker = ({
  date,
  minDate,
  maxDate,
  onDateChange,
  native,
  testId = NAME,
  className,
  ...props
}: DatepickerProps) => {
  const [theme] = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const datepickerRef = useRef<HTMLDivElement>(null);

  if (native)
    return (
      <Native
        date={date}
        minDate={minDate}
        maxDate={maxDate}
        onDateChange={onDateChange}
        testId={testId}
        {...props}
      />
    );

  const blur = () =>
    (document.activeElement as HTMLElement)?.blur();

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    // Keyboard mappings for interacting with the date `<CalendarMenu>`
    // Escape & Enter both close the `<CalendarMenu>`
    if (event.key === 'Escape' || event.key === 'Enter')
      blur();
    // Move the currently selected date in the `<CalendarGrid />`
    else if (event.key === 'ArrowLeft' && date)
      onDateChange(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - 1
        )
      );
    else if (event.key === 'ArrowRight' && date)
      onDateChange(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1
        )
      );
    else if (event.key === 'ArrowUp' && date)
      onDateChange(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - 7
        )
      );
    else if (event.key === 'ArrowDown' && date)
      onDateChange(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 7
        )
      );
  };

  const handleOnFocus = () => setIsOpen(true);

  const handleDatePick = () => blur();

  const handleBlurCapture = (event: React.FocusEvent) => {
    // Only close if focus moves outside `<Datepicker>` and its subcomponents
    if (
      !datepickerRef.current?.contains(
        event.relatedTarget as Node
      )
    )
      setIsOpen(false);
  };

  const baseStyle = css`
    position: relative;
    width: max-content;
    user-select: none;

    &:focus-visible,
    &:focus-within {
      box-shadow: ${theme.boxShadow.focus};
      outline: none;
    }
  `;

  const style = cx(baseStyle, className);

  return (
    <div
      className={style}
      ref={datepickerRef}
      onFocus={handleOnFocus}
      onBlurCapture={handleBlurCapture}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-testid={testId}
    >
      <DateField
        date={date}
        onChange={onDateChange}
        testId={testId}
      />
      {isOpen && (
        <CalendarMenu
          date={date}
          setDate={onDateChange}
          onDatePick={handleDatePick}
          testId={testId}
        />
      )}
    </div>
  );
};

export default memo(Datepicker);
