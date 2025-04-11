import {
  HTMLAttributes,
  forwardRef,
  memo,
  useCallback,
} from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import Blanket from '../Blanket';

export const NAME = 'ucl-modal';

export interface ModalProps
  extends HTMLAttributes<HTMLDivElement> {
  centered?: boolean;
  closeOnClickOutside?: boolean;
  onClose?: () => void;
  testId?: string;
}

export type Ref = HTMLDivElement;

const Modal = forwardRef<Ref, ModalProps>(
  (
    {
      centered = false,
      closeOnClickOutside = true,
      onClose,
      testId = NAME,
      className,
      children,
      ...props
    }: ModalProps,
    ref
  ) => {
    const [theme] = useTheme();

    const positioningBaseStyle = css`
      margin: ${theme.margin.m32} auto;
      max-width: 600px;
      font-family: ${theme.font.family.primary};
      font-size: ${theme.font.size.f16};
      color: ${theme.color.text.primary};
      pointer-events: none;
    `;

    const positioningVerticallyCentredStyle = css`
      min-height: calc(100% - ${theme.margin.m64});
      display: flex;
      flex-direction: column;
      justify-content: center;
    `;

    const positioningStyle = cx(
      NAME,
      positioningBaseStyle,
      centered && positioningVerticallyCentredStyle,
      className
    );

    const dialogStyle = css`
      position: relative;
      background-clip: padding-box;
      background-color: ${theme.color.neutral.white};
      box-shadow: ${theme.boxShadow.x2y4};
      outline: 0;
      pointer-events: auto;
    `;

    const handleOutsideDialogClick = useCallback(
      (ev: React.MouseEvent<HTMLDivElement>) => {
        if (ev.target === ev.currentTarget && onClose) {
          onClose();
        }
      },
      [onClose]
    );

    return (
      <Blanket
        className={className}
        onClick={
          closeOnClickOutside
            ? handleOutsideDialogClick
            : undefined
        }
      >
        <div
          className={positioningStyle}
          {...props}
        >
          <div
            role='dialog'
            aira-modal='true'
            ref={ref}
            data-testid={testId}
            className={dialogStyle}
          >
            {children}
          </div>
        </div>
      </Blanket>
    );
  }
);

export default memo(Modal);
