import {
  memo,
  SelectHTMLAttributes,
  forwardRef,
} from 'react';
import { css, cx } from '@emotion/css';
import { useTheme } from '../..';
import { dataUri as chevronDownSvgDataUri } from '../Icon/svgs/ChevronDownSvg';

export const NAME = 'ucl-uikit-select';

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  testId?: string;
}

export type Ref = HTMLSelectElement;

const Select = forwardRef<Ref, SelectProps>(
  ({ testId = NAME, className, ...props }, ref) => {
    const [theme] = useTheme();

    const baseStyle = css`
      height: ${theme.padding.p48};
      line-height: ${theme.padding.p48};
      font-family: ${theme.font.family.primary};
      padding: 0 ${theme.padding.p40} 0 ${theme.padding.p16};
      background-color: ${theme.color.neutral.white};
      border: ${theme.border.b1} solid
        ${theme.color.neutral.grey40};
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      outline: none;
      cursor: pointer;

      background-image: url(${chevronDownSvgDataUri(
        theme.color.interaction.blue70
      )});
      background-size: 24px 24px;
      background-position: right 8px center;
      background-repeat: no-repeat;
    `;

    const hoverStyle = css`
      &:hover {
        border-color: ${theme.color.neutral.grey60};
        background-color: ${theme.color.neutral.grey5};
      }
    `;

    const focusStyle = css`
      &:focus {
        box-shadow: ${theme.boxShadow.focus};
      }
    `;

    const disabledStyle = css`
      cursor: not-allowed;
    `;

    const style = cx(
      NAME,
      baseStyle,
      !props.disabled && hoverStyle,
      !props.disabled && focusStyle,
      props.disabled && disabledStyle,
      className
    );

    return (
      <select
        ref={ref}
        className={style}
        data-testid={testId}
        {...props}
      />
    );
  }
);

export default memo(Select);
