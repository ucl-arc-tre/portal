import { HTMLAttributes, ReactNode, useCallback, useContext } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import Heading, { HeadingProps } from '../Heading';
import Icon from '../Icon';
import IconButton from '../IconButton';
import { DialogContext } from './Dialog';

export const NAME = 'ucl-uikit-dialog__header';

export interface DialogHeaderProps extends HTMLAttributes<HTMLDialogElement> {
  decoration?: ReactNode;
  headingProps?: HeadingProps;
  closeButtonStopPropagation?: boolean;
  testId?: string;
}

const DialogHeader = ({
  decoration,
  headingProps,
  closeButtonStopPropagation = true,
  children,
  testId = NAME,
  className,
}: DialogHeaderProps) => {
  const { onClose } = useContext(DialogContext);

  const [theme] = useTheme();

  const headerStyle = css`
    padding: ${theme.padding.p32} ${theme.padding.p32} 0 ${theme.padding.p32};
  `;

  const closeStyle = css`
    height: ${theme.height.h32};
    display: flex;
    justify-content: flex-end;
    align-items: start;
  `;

  const style = cx(NAME, headerStyle, className);

  const handleCloseButtonClick = useCallback(
    (ev: React.MouseEvent) => {
      if (onClose) {
        if (closeButtonStopPropagation) {
          ev.stopPropagation();
        }
        onClose(ev);
      }
    },
    [closeButtonStopPropagation, onClose]
  );

  return (
    <header
      className={style}
      data-testid={testId}
    >
      <div className={closeStyle}>
        <IconButton
          aria-label='Close dialog'
          onClick={handleCloseButtonClick}
        >
          <Icon.X
            role='presentation'
            aria-hidden='true'
          />
        </IconButton>
      </div>
      {decoration && decoration}
      <Heading
        level={3}
        margins={false}
        {...headingProps}
      >
        {children}
      </Heading>
    </header>
  );
};

export default DialogHeader;
