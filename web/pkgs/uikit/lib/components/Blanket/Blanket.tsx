import { HTMLAttributes, forwardRef, memo, useCallback } from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../../theme';

export const NAME = 'ucl-blanket';

export interface BlanketProps extends HTMLAttributes<HTMLDivElement> {
  testId?: string;
}

export type Ref = HTMLDivElement;

const Blanket = forwardRef<Ref, BlanketProps>(
  (
    {
      testId = NAME,
      onClick,
      className,

      ...props
    }: BlanketProps,
    ref
  ) => {
    const [theme] = useTheme();

    const baseStyle = css`
      position: fixed;
      top: 0;
      left: 0;
      z-index: 900; // TODO: specify z-index rules in one place
      width: 100%;
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      outline: 0;
      user-select: none;
      pointer-events: auto;
      background-color: ${theme.color.overlay};
    `;

    const style = cx(NAME, baseStyle, className);

    const handleClick = useCallback(
      (ev: React.MouseEvent<HTMLDivElement>) => {
        if (onClick && ev.target === ev.currentTarget) {
          onClick(ev);
        }
      },
      [onClick]
    );

    return (
      <div
        ref={ref}
        data-testid={testId}
        aria-hidden='true'
        aria-label='Backdrop overlay, click to close modal'
        className={style}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
/* export { blanketColourStyle }; */
export default memo(Blanket);
