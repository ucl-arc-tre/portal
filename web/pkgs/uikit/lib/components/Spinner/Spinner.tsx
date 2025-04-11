import { SVGAttributes, forwardRef, memo } from 'react';
import { css, cx } from '@emotion/css';

export const NAME = 'ucl-uikit-spinner';

export interface SpinnerProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
  testId?: string;
}

const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ size = 24, className, testId = NAME, ...rest }: SpinnerProps, ref) => {
    const rotationDuration = `2s`; // rotation duration
    const dashDuration = `1.5s`; // dash duration

    const gStyle = css`
      transform-origin: 50% 50%;
      animation: rotate ${rotationDuration} linear infinite;

      @keyframes rotate {
        100% {
          transform: rotate(360deg);
        }
      }
    `;

    const circleStyle = css`
      stroke-linecap: square;
      animation: dash ${dashDuration} ease-in-out infinite;

      @keyframes dash {
        0% {
          stroke-dasharray: 1, 150;
          stroke-dashoffset: 0;
        }
        50% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -35;
        }
        100% {
          stroke-dasharray: 90, 150;
          stroke-dashoffset: -124;
        }
      }
    `;

    const style = cx(NAME, className);

    return (
      <svg
        viewBox='0 0 50 50'
        className={style}
        data-testid={testId}
        ref={ref}
        width={size} // Set the width of the SVG element
        height={size} // Set the height of the SVG element
        {...rest}
      >
        <g className={gStyle}>
          <circle
            className={circleStyle}
            cx='25'
            cy='25'
            r='20'
            fill='none'
            stroke='currentColor'
            strokeWidth={8}
          />
        </g>
      </svg>
    );
  }
);

export default memo(Spinner);
