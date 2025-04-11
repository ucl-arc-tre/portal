import { HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';

export const NAME = 'ucl-divider';

export interface DividerProps
  extends Omit<HTMLAttributes<HTMLHRElement>, 'children'> {
  testId?: string;
}

const Divider = ({
  testId = NAME,
  className,
  ...props
}: DividerProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    margin: 0;
    height: 1px;
    border: none;
    background-color: ${theme.color.neutral.grey20 ||
    '#000'};
  `;

  const style = cx(NAME, baseStyle, className);

  return (
    <hr
      className={style}
      data-testid={testId}
      role='separator'
      {...props}
    />
  );
};

export default Divider;
