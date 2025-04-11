import { css } from '@emotion/css';
import { useTheme } from '../../../../theme';

const ColumnHeadings = () => {
  const [theme] = useTheme();

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const headingStyle = (isWeekend: boolean) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 32px;
    color: ${isWeekend
      ? theme.color.system.orange100
      : theme.color.neutral.grey60};
    font-weight: 700;
  `;

  return (
    <>
      {days.map((day, index) => (
        <div
          key={index}
          className={headingStyle(index >= 5)}
        >
          {day}
        </div>
      ))}
    </>
  );
};

export default ColumnHeadings;
