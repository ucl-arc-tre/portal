import { memo, forwardRef, ReactNode, useId } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import Radio, { RadioProps } from './Radio';
import Label, { LabelProps } from '../Label';
import marginsStyle, { MarginProps } from '../common/marginsStyle';

export const NAME = 'ucl-uikit-labelled-radio';

export interface LabelledRadioBaseProps extends RadioProps {
  labelProps?: LabelProps;
  children: ReactNode;
  testId?: string;
}

export type LabelledRadioProps = LabelledRadioBaseProps & MarginProps;

export type Ref = HTMLInputElement;

const LabelledRadio = forwardRef<Ref, LabelledRadioProps>(
  (
    {
      id,
      labelProps,
      testId = NAME,
      m,
      mv,
      mh,
      mt,
      mb,
      ml,
      mr,
      noMargins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [theme] = useTheme();

    const generatedId = useId();

    id = id ?? generatedId;

    const baseStyle = css`
      margin-top: ${theme.margin.m16};
      margin-bottom: ${theme.margin.m16};
      display: flex;
      align-items: center;
      gap: ${theme.m16};
      width: fit-content;
    `;

    const focusStyle = css`
      &:focus-within {
        box-shadow: ${theme.boxShadow.focus};
      }
    `;

    const style = cx(
      NAME,
      baseStyle,
      !props.disabled && focusStyle,
      marginsStyle(
        {
          m,
          mv,
          mh,
          mt,
          mb,
          ml,
          mr,
          noMargins,
        },
        theme
      ),
      className
    );

    const radioStyle = css`
      &:focus-within {
        box-shadow: none;
      }
    `;

    return (
      <div
        className={style}
        data-testid={testId}
      >
        <Radio
          ref={ref}
          className={radioStyle}
          id={id}
          data-testid={`${testId}__radio`}
          {...props}
        />
        <Label
          htmlFor={labelProps?.htmlFor ?? id}
          data-testid={`${testId}__label`}
          {...labelProps}
        >
          {children}
        </Label>
      </div>
    );
  }
);

export default memo(LabelledRadio);
