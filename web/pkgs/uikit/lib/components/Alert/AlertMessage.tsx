import { css, cx } from '@emotion/css';
import { theme } from '../../theme';
import { HTMLAttributes } from 'react';

export const NAME = 'ucl-uikit-alert__message';

export interface AlertMessageProps
  extends HTMLAttributes<HTMLParagraphElement> {
  testId?: string;
}

const AlertMessage = ({
  testId = NAME,
  className,
  children,
}: AlertMessageProps) => {
  const messageStyles = css`
    font-size: ${theme.font.size.f16};
    color: ${theme.color.text.primary};
    margin: 0;
    line-height: 1.5;
  `;
  const style = cx(messageStyles, NAME, className);

  return (
    <p
      className={style}
      data-testid={testId}
    >
      {children}
    </p>
  );
};

export default AlertMessage;
