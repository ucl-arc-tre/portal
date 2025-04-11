import { css } from '@emotion/css';
import { ColumnHeadings, Day } from '../';
import useTheme from '../../../../theme/useTheme';
import { getDatesForCalendarGrid } from '../../utils';

interface CalendarGridProps {
  date: Date | null | undefined;
  onDatePick: (date: Date) => void;
}

const CalendarGrid = ({
  date,
  onDatePick,
}: CalendarGridProps) => {
  const [theme] = useTheme();

  const dates = date
    ? getDatesForCalendarGrid(date)
    : getDatesForCalendarGrid(new Date());

  const gridStyle = css`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0;
    text-align: center;
    font-family: ${theme.font.family.primary};
    font-weight: 400;
    user-select: none;
  `;

  return (
    <div className={gridStyle}>
      <ColumnHeadings />
      {dates.map((mappedDate) => (
        <Day
          key={mappedDate.toISOString()}
          date={mappedDate}
          isSelected={
            date?.toDateString() ===
            mappedDate.toDateString()
          }
          isToday={
            mappedDate.toDateString() ===
            new Date().toDateString()
          }
          isInCurrentMonth={
            date
              ? mappedDate.getMonth() === date?.getMonth()
              : mappedDate.getMonth() ===
                new Date().getMonth()
          }
          onPick={onDatePick}
        />
      ))}
    </div>
  );
};

export default CalendarGrid;
