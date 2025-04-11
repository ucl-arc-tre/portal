import React, {
  HTMLAttributes,
  useCallback,
  memo,
  useEffect,
  useRef,
} from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';

export const NAME = 'ucl-uikit-base-dialog';
export const SMALL_WIDTH = 495;
export const MEDIUM_WIDTH = 495;
export const LARGE_WIDTH = 740;

export interface BaseDialogProps extends HTMLAttributes<HTMLDialogElement> {
  open?: boolean;
  size?: 'small' | 'medium' | 'large';
  modal?: boolean;
  closeOnClickOutside?: boolean;
  closeOnClickOutsideStopPropagation?: boolean;
  onClose?: (ev: React.MouseEvent) => void;
  testId?: string;
}

const BaseDialog = ({
  open = false,
  size = 'medium',
  modal = true,
  closeOnClickOutside = true,
  closeOnClickOutsideStopPropagation = true,
  onClose,
  testId = NAME,
  className,
  children,
  ...props
}: BaseDialogProps) => {
  const width = {
    small: SMALL_WIDTH,
    medium: MEDIUM_WIDTH,
    large: LARGE_WIDTH,
  }[size];

  const [theme] = useTheme();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const hideBodyScroll = css`
    overflow: hidden;
  `;

  useEffect(() => {
    if (open && modal) {
      document.body.classList.add(hideBodyScroll);
    } else {
      document.body.classList.remove(hideBodyScroll);
    }
    return () => {
      document.body.classList.remove(hideBodyScroll);
    };
  }, [open, modal, hideBodyScroll]);

  useEffect(() => {
    const dialogElement = dialogRef.current;

    if (!dialogElement) return;

    if (open && !dialogElement.hasAttribute('open')) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      if (modal) {
        dialogElement.showModal();
      } else {
        dialogElement.show();
      }
    } else if (!open && dialogElement.hasAttribute('open')) {
      dialogElement.close();
      previousActiveElement.current?.focus();
    }
  }, [open, modal]);

  const handleClick = useCallback(
    (ev: React.MouseEvent<HTMLDialogElement>) => {
      if (closeOnClickOutside && onClose && dialogRef.current) {
        if (closeOnClickOutsideStopPropagation) {
          ev.stopPropagation();
        }
        const rect = dialogRef.current.getBoundingClientRect();
        const isInDialog =
          rect.top <= ev.clientY &&
          ev.clientY <= rect.top + rect.height &&
          rect.left <= ev.clientX &&
          ev.clientX <= rect.left + rect.width;
        if (!isInDialog) {
          onClose(ev);
        }
      }
    },
    [closeOnClickOutside, closeOnClickOutsideStopPropagation, onClose]
  );

  const handleDialogClose = useCallback(
    (ev: React.MouseEvent<HTMLDialogElement>) => {
      if (onClose) {
        onClose(ev);
      }
    },
    [onClose]
  );

  const baseStyle = css`
    padding: 0;
    border: none;
    background: ${theme.color.neutral.white};
    color: ${theme.color.text.primary};
    font-family: ${theme.font.family.primary};
    font-size: ${theme.font.size.f16};
    width: 100vw;
    height: 100vh;
    margin: auto;

    &:modal {
      max-width: none;
      max-height: none;
    }

    @media (min-width: ${theme.breakpoints.tablet}px) {
      width: ${width}px;
      max-width: calc(100vw - ${theme.margin.m16}px);
      height: fit-content;

      &:modal {
        max-width: ${MEDIUM_WIDTH}px;
        max-height: calc(100vh - 32px);
      }
    }

    &::backdrop {
      background-color: ${theme.color.overlay.blanket};
    }
  `;

  const style = cx(NAME, baseStyle, className);

  if (open) {
    return (
      <dialog
        ref={dialogRef}
        className={style}
        data-testid={testId}
        onClick={handleClick}
        onClose={handleDialogClose}
        {...props}
      >
        {children}
      </dialog>
    );
  } else {
    return null;
  }
};

export default memo(BaseDialog);
