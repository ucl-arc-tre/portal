import { css } from '@emotion/css';
import { Icon } from '../../..';
import { useTheme } from '../../../../theme';

interface MonthSelectorProps {
  date: Date | null | undefined;
  changeMonth: (change: number) => void;
}

const MonthSelector = ({
  date,
  changeMonth,
}: MonthSelectorProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 30px;
  `;

  const monthAndYearStyle = css`
    display: flex;
    gap: 8px;
    font-family: ${theme.font.family.primary};
    font-weight: 700;
    user-select: none;
  `;

  const chevronIconStyle = css`
    cursor: pointer;

    &:hover {
      color: ${theme.color.neutral.grey60};
    }
  `;

  return (
    <div className={baseStyle}>
      <Icon.ChevronLeft
        className={chevronIconStyle}
        onClick={() => changeMonth(-1)}
      />
      <span className={monthAndYearStyle}>
        <span>
          {date
            ? date.toLocaleDateString('default', {
                month: 'long',
              })
            : new Date().toLocaleDateString('default', {
                month: 'long',
              })}
        </span>
        <span>
          {date
            ? date.getFullYear()
            : new Date().getFullYear()}
        </span>
      </span>
      <Icon.ChevronRight
        className={chevronIconStyle}
        onClick={() => changeMonth(1)}
      />
    </div>
  );
};

export default MonthSelector;
