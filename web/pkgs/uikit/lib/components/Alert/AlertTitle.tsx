import { css } from '@emotion/css';
import { theme } from '../../theme';
import { HTMLAttributes } from 'react';

export const NAME = 'ucl-uikit-alert__title';

export interface AlertTitleProps
  extends HTMLAttributes<HTMLHeadingElement> {
  testId?: string;
}

const AlertTitle = ({
  children,
  testId = NAME,
}: AlertTitleProps) => {
  const titleStyles = css`
    margin: 0 0 ${theme.margin.m8} 0;
    font-family: ${theme.font.family.primary};
    font-size: ${theme.font.size.f16};
    font-weight: 700;
    color: ${theme.color.text.primary};
  `;

  return (
    <h3
      className={titleStyles}
      data-test-id={testId}
    >
      {children}
    </h3>
  );
};

export default AlertTitle;
