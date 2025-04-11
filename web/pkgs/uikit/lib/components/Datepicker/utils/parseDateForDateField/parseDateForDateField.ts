/**
 * Parses a date string and returns a `Date` object.
 *
 * Can handle date strings entered by the user as "day/month/year", "day month year", or "day-month-year".
 * If the date is not in the expected format or contains invalid numbers, it returns `null`.
 *
 * Used solely by `<DateField>` component.
 *
 * - A one-digit or two-digit year is assumed to be in the 21st century (e.g., '21' becomes '2021').
 *
 * @param {string} dateString - The date string to be parsed.
 *
 * @future Any additional validation logic for dates entered by the user should be added here.
 * For example, supporting formats like "day / month / year" (separated with a space and a slash)
 * or "daymonthyear" (without spaces or separators).
 *
 * @returns {void}
 */
const parseDate = (dateString: string) => {
  // Remove any leading or trailing whitespace and split the string into parts,
  // separated by a slash, space, or hyphen
  const dateParts = dateString.trim().split(/[-/ ]/);
  if (dateParts.length !== 3) {
    return null;
  }

  const parsedDay = parseInt(dateParts[0], 10); // (Second argument is just for base 10 -- decimal)
  const parsedMonth = parseInt(dateParts[1], 10);
  let parsedYear = parseInt(dateParts[2], 10);
  if (
    isNaN(parsedDay) ||
    isNaN(parsedMonth) ||
    isNaN(parsedYear)
  ) {
    return null;
  }

  // We can assume a one-digit or two-digit year is in the 21st century
  if (
    parsedYear.toString().length === 2 ||
    parsedYear.toString().length === 1
  )
    parsedYear += 2000;

  return new Date(parsedYear, parsedMonth - 1, parsedDay); // month is 0-indexed
};

export default parseDate;
