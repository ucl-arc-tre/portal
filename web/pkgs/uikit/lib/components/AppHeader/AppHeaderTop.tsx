import { memo, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { UclLogo, useTheme } from '../../';

export const NAME = 'ucl-timetable-app-header__top';

export const HEIGHT = 56;

export interface AppHeaderTopProps
  extends HTMLAttributes<HTMLDivElement> {
  uclLogo?: boolean;
  logoClassName?: string;
  testId?: string;
}

const AppHeaderTop = ({
  uclLogo = true,
  logoClassName,
  testId = NAME,
  className,
  children,
  ...props
}: AppHeaderTopProps) => {
  const [theme] = useTheme();

  const baseStyle = css`
    height: ${HEIGHT}px;
    padding: 0 ${theme.padding.p16};
    display: flex;
  `;

  const style = cx(NAME, baseStyle, className);

  const uclLogoBaseStyle = css`
    display: block;
    margin-left: auto;
    height: 100%;
    color: ${theme.color.display
      .greenDark}; // default header/logo colour
  `;

  const uclLogoStyle = cx(uclLogoBaseStyle, logoClassName);

  return (
    <div
      className={style}
      data-testid={testId}
      {...props}
    >
      {children}

      {uclLogo && <UclLogo className={uclLogoStyle} />}
    </div>
  );
};

export default memo(AppHeaderTop);
