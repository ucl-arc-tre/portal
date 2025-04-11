import { css } from '@emotion/css';
import MonthSelector from '../MonthSelector';
import CalendarGrid from '../CalendarGrid';
import useTheme from '../../../../theme/useTheme';

interface CalendarMenuProps {
  date: Date | null | undefined;
  setDate: (date: Date) => void;
  onDatePick: () => void;
  testId?: string;
}

const CalendarMenu = ({
  date,
  setDate,
  onDatePick,
  testId = 'ucl',
}: CalendarMenuProps) => {
  const [theme] = useTheme();

  const onMonthChange = (change: number) => {
    const newDate = date ? new Date(date) : new Date();
    newDate.setMonth(newDate.getMonth() + change);
    setDate(newDate);
  };

  const style = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 280px;
    height: 320px;
    z-index: 10;
    position: absolute;
    top: 60px;
    border: 1px solid ${theme.color.neutral.grey20};
    padding: 16px;
    background-color: ${theme.color.neutral.white};
  `;

  const handlePick = (pickedDate: Date) => {
    setDate(pickedDate);
    onDatePick();
  };

  return (
    <div
      className={style}
      data-testid={testId + '-calendar-menu'}
    >
      <MonthSelector
        date={date}
        changeMonth={onMonthChange}
      />
      <CalendarGrid
        date={date}
        onDatePick={handlePick}
      />
    </div>
  );
};

export default CalendarMenu;
