import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import { ButtonProps, Icon, Text } from '..';
import Dialog, { DialogProps } from '../Dialog';
import { ReactNode } from 'react';

export const NAME = 'ucl-uikit-dialog--feedback';
export const ICON_SIZE = 72;

export type FeedbackType = 'success' | 'warning' | 'error';

export interface FeedbackDialogProps extends DialogProps {
  type: FeedbackType;
  heading: ReactNode;
  buttonLabel: ReactNode;
  buttonVariant?: ButtonProps['variant'];
  buttonProps?: ButtonProps;
}

const FeedbackDialog = ({
  type,
  heading,
  buttonLabel,
  buttonVariant = 'primary',
  buttonProps,
  testId = NAME,
  className,
  children,
  ...props
}: FeedbackDialogProps) => {
  const [theme] = useTheme();

  const {
    color: {
      system: { green70, orange70, red70 },
    },
  } = theme;

  const iconBaseStyle = css`
    display: block;
    margin-top: ${theme.margin.m32};
    margin-bottom: ${theme.margin.m32};
    margin-left: auto;
    margin-right: auto;
  `;

  const iconStyle = cx(
    iconBaseStyle,
    type === 'success' &&
      css`
        color: ${green70};
      `,
    type === 'warning' &&
      css`
        color: ${orange70};
      `,
    type === 'error' &&
      css`
        color: ${red70};
      `
  );

  const icon = {
    success: (
      <Icon.CheckCircle
        size={ICON_SIZE}
        className={iconStyle}
      />
    ),
    error: (
      <Icon.XCircle
        size={ICON_SIZE}
        className={iconStyle}
      />
    ),
    warning: (
      <Icon.AlertTriangle
        size={ICON_SIZE}
        className={iconStyle}
      />
    ),
  }[type];

  const baseStyle = css``;

  const style = cx(NAME, baseStyle, className);

  const headingStyle = css`
    text-align: center;
  `;

  const textStyle = css`
    margin-left: ${theme.margin.m32};
    margin-right: ${theme.margin.m32};
    text-align: center;
  `;

  const footerStyle = css`
    margin-top: ${theme.margin.m40};
    margin-bottom: ${theme.margin.m48};
    justify-content: center;
  `;

  return (
    <Dialog
      testId={testId}
      className={style}
      {...props}
    >
      <Dialog.Header
        decoration={icon}
        headingProps={{
          className: headingStyle,
        }}
      >
        {heading}
      </Dialog.Header>
      <Text className={textStyle}>{children}</Text>
      <Dialog.Footer
        className={footerStyle}
        primaryButton={buttonLabel}
        primaryButtonProps={{
          variant: buttonVariant,
          ...buttonProps,
        }}
      />
    </Dialog>
  );
};

export default FeedbackDialog;
