import { css } from '@emotion/css';
import { theme } from '../../../../theme';

interface NativeProps {
  date?: Date | null | undefined;
  minDate?: Date | null | undefined;
  maxDate?: Date | null | undefined;
  onDateChange?: (date: Date | null | undefined) => void;
  testId?: string;
}

const Native = ({
  date,
  minDate,
  maxDate,
  onDateChange,
  testId,
  ...props
}: NativeProps) => {
  const inputStyle = css`
    width: 200px;
    height: 48px;
    padding: 0 16px;
    border: 1px solid #000;
    color: #1a1a1a;
    font-size: 16px;
    font-family: sans-serif;
    text-transform: uppercase;
    cursor: pointer;

    &:focus-visible {
      outline: none;
      box-shadow: ${theme.boxShadow.focus};
    }
  `;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => onDateChange?.(event.target.valueAsDate);

  return (
    <input
      type='date'
      value={date ? date.toISOString().split('T')[0] : ''}
      min={
        minDate ? minDate.toISOString().split('T')[0] : ''
      }
      max={
        maxDate ? maxDate.toISOString().split('T')[0] : ''
      }
      onChange={handleChange}
      className={inputStyle}
      data-testid={testId}
      {...props}
    />
  );
};

export default Native;
