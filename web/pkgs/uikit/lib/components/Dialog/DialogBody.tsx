import { memo, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';

export const NAME = 'ucl-uikit-dialog__body';

export interface DialogBodyProps extends HTMLAttributes<HTMLDivElement> {
  testId?: string;
}

const DialogBody = ({
  children,
  testId = NAME,
  className,
}: DialogBodyProps) => {
  const [theme] = useTheme();

  const contentStyle = css`
    margin: ${theme.padding.p24} ${theme.padding.p32};
  `;

  const style = cx(NAME, contentStyle, className);

  return (
    <div
      className={style}
      data-testid={testId}
      role='document'
    >
      {children}
    </div>
  );
};

export default memo(DialogBody);
