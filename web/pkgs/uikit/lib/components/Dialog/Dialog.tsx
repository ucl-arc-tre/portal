import { createContext } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import BaseDialog, { BaseDialogProps } from './BaseDialog';
import DialogHeader from './DialogHeader';
import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';

export const NAME = 'ucl-uikit-dialog';

interface DialogContextValue {
  onClose?: (ev: React.MouseEvent) => void;
  onSecondaryAction?: () => void;
  onAction?: () => void;
}

export const DialogContext = createContext<DialogContextValue>({});

export interface DialogProps extends BaseDialogProps {
  onAction?: () => void;
  onSecondaryAction?: () => void;
}

const Dialog = ({
  onClose,
  onAction,
  onSecondaryAction,
  testId = NAME,
  className,
  children,
  ...props
}: DialogProps) => {
  const [theme] = useTheme();

  const contextValue: DialogContextValue = {
    onClose,
    onAction,
    onSecondaryAction,
  };

  const baseStyle = css`
    box-shadow: ${theme.boxShadow.x2y4};
  `;

  const style = cx(NAME, baseStyle, className);

  return (
    <DialogContext value={contextValue}>
      <BaseDialog
        onClose={onClose}
        testId={testId}
        className={style}
        {...props}
      >
        {children}
      </BaseDialog>
    </DialogContext>
  );
};

export interface DialogSubComponents {
  Header: typeof DialogHeader;
  Body: typeof DialogBody;
  Footer: typeof DialogFooter;
}

const DialogWithSubcomponents = Dialog as typeof Dialog & DialogSubComponents;

DialogWithSubcomponents.Header = DialogHeader;
DialogWithSubcomponents.Body = DialogBody;
DialogWithSubcomponents.Footer = DialogFooter;

export default DialogWithSubcomponents;
