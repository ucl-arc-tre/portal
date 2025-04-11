import { memo, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../..';

export const NAME = 'ucl-uikit-footer__column';

export interface FooterColumnProps
  extends HTMLAttributes<HTMLDivElement> {
  heading: string;
  testId?: string;
}

const FooterColumn = ({
  heading,
  testId = NAME,
  className,
  children,
  ...props
}: FooterColumnProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    margin-top: ${theme.margin.m24};
    margin-bottom: ${theme.margin.m24};
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: start;
  `;

  const style = cx(NAME, baseStyle, className);

  const headingStyle = css`
    margin: 0 0 ${theme.margin.m12};
    font-family: ${theme.font.family.primary};
    font-weight: 600;
    font-size: ${theme.font.size.f20};
  `;

  return (
    <div
      className={style}
      data-testid={testId}
      {...props}
    >
      <h3 className={headingStyle}>{heading}</h3>

      {children}
    </div>
  );
};

export default memo(FooterColumn);
