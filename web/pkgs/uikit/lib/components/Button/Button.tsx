import { memo, ButtonHTMLAttributes, forwardRef } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import buttonPrimaryStyle from './buttonPrimaryStyle';
import buttonSecondaryStyle from './buttonSecondaryStyle';
import buttonTertiaryStyle from './buttonTertiaryStyle';

export const NAME = 'ucl-uikit-button';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  destructive?: boolean;
  size?: 'large' | 'default' | 'small';
  disabled?: boolean;
  testId?: string;
}

export type Ref = HTMLButtonElement;

const Button = forwardRef<Ref, ButtonProps>(
  (
    {
      variant = 'primary',
      destructive = false,
      size = 'default',
      disabled = false,
      testId = NAME,
      children,
      className,
      ...props
    },
    ref
  ) => {
    if (variant === 'tertiary' && destructive) {
      console.warn(
        'Button: tertiary and destructive props cannot be used together'
      );
    }

    const [theme] = useTheme();

    const baseStyle = css`
      font-family: ${theme.font.family.primary};
      font-size: ${theme.font.size.f16};
      outline: none;

      &:focus-visible {
        box-shadow: ${theme.boxShadow.focus};
      }
    `;

    const sizeSmallStyle = css`
      height: 40px;
      padding: 0 ${theme.padding.p16};
    `;

    const sizeDefaultStyle = css`
      height: 48px;
      padding: 0 ${theme.padding.p24};
    `;

    const sizeLargeStyle = css`
      height: 56px;
      padding: 0 ${theme.padding.p24};
      font-size: ${theme.font.size.f18};
    `;

    const variantStyle = {
      primary: buttonPrimaryStyle(theme, destructive, disabled),
      secondary: buttonSecondaryStyle(theme, destructive, disabled),
      tertiary: buttonTertiaryStyle(theme, disabled),
    }[variant];

    const style = cx(
      NAME,
      baseStyle,
      size === 'small' && sizeSmallStyle,
      size === 'default' && sizeDefaultStyle,
      size === 'large' && sizeLargeStyle,
      variantStyle,
      className
    );

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={style}
        data-testid={testId}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export default memo(Button);
