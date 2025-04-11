import { css } from '@emotion/css';
import { useTheme } from '../../../../theme/';

export interface DayProps {
  date: Date | null | undefined;
  isSelected?: boolean;
  isToday?: boolean;
  isInCurrentMonth?: boolean;
  isDisabled?: boolean;
  onPick?: (date: Date) => void;
}

const Day = ({
  date,
  isSelected,
  isToday = false,
  isInCurrentMonth = true,
  isDisabled = false,
  onPick,
}: DayProps) => {
  const [theme] = useTheme();

  const onClick = () => {
    if (date && onPick) onPick(date);
  };

  const backgroundStyle = css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background-color: ${theme.color.neutral.white};
    cursor: pointer;
    outline: none;

    &:hover {
      background-color: ${theme.color.neutral.grey10};
    }

    ${isSelected &&
    css`
      background-color: ${theme.color.interaction.blue70};
      color: ${theme.color.text.inverted};

      &:hover {
        background-color: ${theme.color.interaction
          .blue100};
      }
    `}
    ${isDisabled &&
    css`
      cursor: not-allowed;

      &:hover {
        background-color: ${theme.color.neutral.white};
      }
    `}
  `;

  const foregroundStyle = css`
    font-family: ${theme.font.family.primary};
    user-select: none;
    font-size: 16px;

    ${!isInCurrentMonth &&
    css`
      color: ${theme.color.neutral.grey40};
    `}
    ${isToday &&
    css`
      font-weight: 700;
    `}
    ${isDisabled &&
    css`
      color: ${theme.color.neutral.grey40};
    `}
  `;

  return (
    <div
      className={backgroundStyle}
      role='button'
      aria-label={`Select ${date?.toDateString()}`}
      onClick={onClick}
    >
      <div className={foregroundStyle}>
        {date?.getDate()}
      </div>
    </div>
  );
};

export default Day;
