import { memo, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';

export const NAME = 'ucl-timetable-app-header__nav';

export interface AppHeaderNavProps
  extends HTMLAttributes<HTMLDivElement> {
  testId?: string;
}

const AppHeaderNav = ({
  testId = NAME,
  className,
  children,
  ...props
}: AppHeaderNavProps) => {
  const baseStyle = css`
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
  `;

  const style = cx(NAME, baseStyle, className);

  return (
    <div
      className={style}
      data-testid={testId}
      {...props}
    >
      {children}

      {/* <img src={burgerIcon} className={menuIconStyle}/> */}
    </div>
  );
};

export default memo(AppHeaderNav);
