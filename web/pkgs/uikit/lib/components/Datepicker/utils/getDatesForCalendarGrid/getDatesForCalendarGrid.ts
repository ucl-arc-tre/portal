/**
 * Generates an array of dates for a calendar grid, including the current month's dates
 * and the "grey days" from the previous and next months to complete the grid.
 * The calendar grid starts on Monday and ends on Sunday.
 *
 * @param date - A Date object representing any date in the month for which to generate the calendar grid
 * @returns An array of Date objects representing all days that should appear in the calendar grid
 * @throws Will throw an error if no date is provided or if the input is not a Date object
 *
 * @example
 * ```typescript
 * const date = new Date(2023, 0, 15); // January 15, 2023
 * const calendarDates = getDatesForCalendarGrid(date);
 * // Returns array of dates starting from last days of December 2022
 * // through all of January 2023 and first days of February 2023
 * // to complete the grid
 * ```
 */
const getDatesForCalendarGrid = (date: Date): Date[] => {
  if (!date || !(date instanceof Date))
    throw new Error('No date provided');

  const month = date.getMonth();
  const daysInMonth = new Date(
    date.getFullYear(),
    month + 1,
    0
  ).getDate();

  // Get all days in current month
  const dates: Date[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const newDate = new Date(
      date.getFullYear(),
      month,
      day
    );
    if (newDate.getMonth() !== month) break;
    dates.push(newDate);
  }

  // For Monday start, we need to adjust the day calculation:
  // Sunday (0) should become 6
  // Monday (1) should become 0
  // Tuesday (2) should become 1, etc.
  const adjustDay = (day: number): number =>
    day === 0 ? 6 : day - 1;

  // Calculate previous month's "grey days"
  const prevMonthGreyDays = [];
  const prevMonth = new Date(
    date.getFullYear(),
    month - 1,
    1
  );
  const firstDayOfMonth = new Date(
    date.getFullYear(),
    month,
    1
  ).getDay();
  const numberOfDaysFromPrevMonth =
    adjustDay(firstDayOfMonth);
  const totalDaysInPrevMonth = new Date(
    date.getFullYear(),
    month,
    0
  ).getDate();

  for (let i = numberOfDaysFromPrevMonth; i > 0; i--) {
    prevMonthGreyDays.push(
      new Date(
        prevMonth.getFullYear(),
        prevMonth.getMonth(),
        totalDaysInPrevMonth - i + 1
      )
    );
  }

  // Calculate next month's "grey days"
  const nextMonthGreyDays = [];
  const nextMonth = new Date(
    date.getFullYear(),
    month + 1,
    1
  );
  const lastDayOfMonth = new Date(
    date.getFullYear(),
    month,
    daysInMonth
  ).getDay();
  const numberOfDaysFromNextMonth =
    6 - adjustDay(lastDayOfMonth);

  for (let i = 1; i <= numberOfDaysFromNextMonth; i++) {
    nextMonthGreyDays.push(
      new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        i
      )
    );
  }

  dates.unshift(...prevMonthGreyDays);
  dates.push(...nextMonthGreyDays);
  return dates;
};

export default getDatesForCalendarGrid;
