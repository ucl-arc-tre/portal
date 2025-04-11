import { memo, forwardRef, OutputHTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import { IconButton, Icon } from '..';

export const NAME = 'ucl-uikit-snackbar';

export interface SnackbarProps extends OutputHTMLAttributes<HTMLOutputElement> {
  action: 'close' | 'undo';
  onClose?: () => void;
  onUndo?: () => void;
  testId?: string;
}

export type Ref = HTMLOutputElement;

// Should this component be a <div> instead of an <output>?
const Snackbar = forwardRef<Ref, SnackbarProps>(
  (
    {
      action = 'close',
      onClose,
      onUndo,
      children,
      testId = NAME,
      className,
      ...props
    },
    ref
  ) => {
    const [theme] = useTheme();

    const baseStyles = css`
      display: flex;
      justify-content: start;
      align-items: center;
      gap: 16px;
      box-sizing: border-box;
      position: fixed;
      width: 375px;
      height: ${theme.height.h80};
      z-index: 9999;
      padding-left: ${theme.padding.p24};
      padding-right: ${theme.padding.p24};
      color: ${theme.color.text.inverted};
      background-color: ${theme.color.neutral.grey90};
      font-size: ${theme.font.size.f16};
      font-family: ${theme.font.family.primary};
      font-weight: ${theme.font.weight.regular};
      line-height: ${theme.font.lineHeight.h140};
    `;

    const checkCircleIconStyle = css`
      min-width: 24px;
      min-height: 24px;
    `;

    const actionButtonStyle = css`
      margin-left: auto;
    `;

    const undoButtonStyle = css`
      padding: ${theme.padding.p4};
      border: none;
      background-color: transparent;
      color: ${theme.color.text.inverted};
      font-size: ${theme.font.size.f16};
      font-family: ${theme.font.family.primary};
      font-weight: 700;
      cursor: pointer;

      &:hover {
        color: ${theme.color.neutral.grey20}; // This is a guess
      }

      &:focus-visible {
        outline: none;
        box-shadow: ${theme.boxShadow.focus};
      }
    `;

    const style = cx(NAME, baseStyles, className);

    return (
      <output
        ref={ref}
        className={style}
        data-testid={testId}
        {...props}
      >
        <Icon.CheckCircle className={checkCircleIconStyle} />

        <span>{children}</span>

        <span className={actionButtonStyle}>
          {action === 'close' && (
            <IconButton
              onClick={
                onClose ??
                (() =>
                  console.warn(
                    '<Snackbar> close action triggered but unassigned'
                  ))
              }
              data-testid={`${testId}-close-button`}
            >
              <Icon.X size={24} />
            </IconButton>
          )}

          {action === 'undo' && (
            <button
              onClick={
                onUndo ??
                (() =>
                  console.warn(
                    '<Snackbar> undo action triggered but unassigned'
                  ))
              }
              className={undoButtonStyle}
              data-testid={`${testId}-undo-button`}
            >
              UNDO
            </button>
          )}
        </span>
      </output>
    );
  }
);

export default memo(Snackbar);
