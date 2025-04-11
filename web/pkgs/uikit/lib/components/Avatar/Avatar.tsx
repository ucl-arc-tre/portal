import {
  ButtonHTMLAttributes,
  forwardRef,
  memo,
  useEffect,
  useState,
} from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import { Icon } from '..';
import extractInitials from './utils/extractInitials';

export const NAME = 'ucl-uikit-avatar';

export interface AvatarProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'image' | 'initials' | 'icon';
  imageUrl?: string;
  name?: string;
  size?: 48 | 56 | 72 | 80;
  disabled?: boolean;
  testId?: string;
}

export type Ref = HTMLButtonElement;

/**
 * <Avatar> implements graceful fallbacks:
 * - If `variant` = 'image', but a valid `imageURL` is not provided, initials will be displayed instead.
 * - If `variant` = 'initials', but a valid `name` is not provided, the icon will be displayed instead.
 */
const Avatar = forwardRef<Ref, AvatarProps>(
  (
    {
      variant = 'image',
      imageUrl,
      name = '',
      size = 48,
      disabled,
      testId = NAME,
      className,
      ...props
    },
    ref
  ) => {
    const [theme] = useTheme();
    const [imageError, setImageError] = useState(false);

    // Reset image error state when imageUrl changes
    // Othwerwise, memoisation causes the error state to persist
    useEffect(() => {
      setImageError(false);
    }, [imageUrl]);

    const fontSize = (size * 2) / 5;
    const initials = extractInitials(name);

    const handleImageError = (
      event: React.SyntheticEvent<HTMLImageElement>
    ) => {
      console.error('Avatar image failed to load', event);
      setImageError(true);
    };

    const baseStyle = css`
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding: 0;
      border-radius: 50%;
      border: none;
      outline: none;
      width: ${size}px;
      height: ${size}px;
      color: ${theme.color.neutral.grey60};
      background-color: ${theme.color.neutral.grey20};
      font-family: ${theme.font.family.primary};
      font-size: ${fontSize}px;
      cursor: pointer;
    `;

    const activeAndFocusStyle = css`
      &:focus-visible {
        box-shadow: ${theme.boxShadow.focus};
      }
    `;

    const disabledStyle = css`
      background-color: ${theme.color.neutral.grey5};
      color: ${theme.color.neutral.grey20};
      cursor: not-allowed;
    `;

    const imageStyle = css`
      width: 100%;
      border-radius: 50%;
      object-fit: cover;
      ${disabled && 'opacity: 50%;'}
    `;

    // Because this text will always be uppercase,
    // we need to nudge it down slightly to center it
    // (no descenders to balance the ascenders).
    const initialsStyle = css`
      padding-top: 0.1em;
      text-transform: uppercase;
    `;

    // `padding-top` to prevent a thin grey line
    // from appearing at the bottom of the icon
    const iconStyle = css`
      color: ${theme.color.neutral.white};
      width: 100%;
      height: 100%;
      padding-top: 0.1em;
    `;

    const style = cx(
      NAME,
      baseStyle,
      !disabled && activeAndFocusStyle,
      disabled && disabledStyle,
      className
    );

    return (
      <button
        ref={ref}
        disabled={disabled}
        data-testid={testId}
        className={style}
        {...props}
      >
        {variant === 'image' && imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={name ?? 'Avatar'}
            onError={handleImageError}
            data-testid={`${testId}-image`}
            className={imageStyle}
          />
        ) : (variant === 'initials' || variant === 'image') && initials ? (
          <span className={initialsStyle}>{initials}</span>
        ) : (
          <Icon.Avatar className={iconStyle} />
        )}
      </button>
    );
  }
);

export default memo(Avatar);
