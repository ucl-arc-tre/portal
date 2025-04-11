import { ReactNode, useContext } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import Button, { ButtonProps } from '../Button';
import { DialogContext } from './Dialog';

export const NAME = 'ucl-uikit-dialog__footer';

export interface DialogFooterProps extends React.HTMLAttributes<HTMLElement> {
  primaryButton?: ReactNode;
  secondaryButton?: ReactNode;
  primaryButtonProps?: ButtonProps;
  secondaryButtonProps?: ButtonProps;
  testId?: string;
}

const DialogFooter = ({
  primaryButton,
  secondaryButton,
  primaryButtonProps,
  secondaryButtonProps,
  testId,
  className,
  ...props
}: DialogFooterProps) => {
  const isOnlyPrimaryButton = !!(primaryButton && !secondaryButton);
  const isOnlySecondaryButton = !!(!primaryButton && secondaryButton);
  const isBothButtons = !!(primaryButton && secondaryButton);

  const { onAction, onSecondaryAction } = useContext(DialogContext);

  const [theme] = useTheme();

  const baseStyle = css`
    display: flex;
    align-items: center;
    margin: ${theme.margin.m24} ${theme.margin.m32} ${theme.margin.m32};
  `;

  const onlyPrimaryButtonStyle = css`
    justify-content: flex-end;
  `;

  const onlySecondaryButtonStyle = css`
    justify-content: flex-start;
  `;

  const bothButtonsStyle = css`
    justify-content: space-between;
  `;

  const style = cx(
    NAME,
    baseStyle,
    isOnlyPrimaryButton && onlyPrimaryButtonStyle,
    isOnlySecondaryButton && onlySecondaryButtonStyle,
    isBothButtons && bothButtonsStyle,
    className
  );

  return (
    <footer
      className={style}
      aria-label='Dialog actions'
      data-testid={testId}
      {...props}
    >
      {secondaryButton && (
        <Button
          onClick={onSecondaryAction}
          variant='secondary'
          {...secondaryButtonProps}
        >
          {secondaryButton}
        </Button>
      )}
      {primaryButton && (
        <Button
          variant='primary'
          onClick={onAction}
          {...primaryButtonProps}
        >
          {primaryButton}
        </Button>
      )}
    </footer>
  );
};

export default DialogFooter;
