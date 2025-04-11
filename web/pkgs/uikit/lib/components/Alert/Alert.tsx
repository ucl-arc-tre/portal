import { createContext, useContext, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { theme } from '../../theme';
import Icon from '../Icon';
import AlertMessage from './AlertMessage';
import AlertTitle from './AlertTitle';

export const NAME = 'ucl-uikit-alert';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertContextProps {
  type: AlertType;
}

export const AlertContext = createContext<AlertContextProps | null>(null);

export function useAlertContext() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlertContext must be used within an Alert');
  }
  return context;
}

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  type: AlertType;
  testId?: string;
}

const Alert = ({
  type,
  children,
  testId = NAME,
  className,
  ...props
}: AlertProps) => {
  const baseStyles = css`
    display: flex;
    font-family: ${theme.font.family.primary};
    align-items: flex-start;
    gap: ${theme.margin.m8};
    padding: ${theme.padding.p16} ${theme.padding.p12} ${theme.padding.p16}
      ${theme.padding.p8};
    border-left-width: 4px;
    border-left-style: solid;
  `;

  const infoStyle = css`
    background-color: ${theme.color.interaction.blue10};
    border-color: ${theme.color.interaction.blue70};
  `;

  const successStyle = css`
    background-color: ${theme.color.system.green10};
    border-color: ${theme.color.system.green70};
  `;

  const warningStyle = css`
    background-color: ${theme.color.system.orange10};
    border-color: ${theme.color.system.orange70};
  `;

  const errorStyle = css`
    background-color: ${theme.color.system.red10};
    border-color: ${theme.color.system.red70};
  `;

  const style = cx(
    NAME,
    baseStyles,
    type === 'info' && infoStyle,
    type === 'success' && successStyle,
    type === 'warning' && warningStyle,
    type === 'error' && errorStyle,
    className
  );

  const iconStyle = cx(
    type === 'info' &&
      css`
        color: ${theme.color.interaction.blue70};
      `,
    type === 'success' &&
      css`
        color: ${theme.color.system.green70};
      `,
    type === 'warning' &&
      css`
        color: ${theme.color.system.orange70};
      `,
    type === 'error' &&
      css`
        color: ${theme.color.system.red70};
      `
  );

  const IconComp = {
    info: Icon.Info,
    success: Icon.CheckCircle,
    warning: Icon.AlertTriangle,
    error: Icon.XCircle,
  }[type];

  return (
    <AlertContext.Provider value={{ type }}>
      <div
        className={style}
        data-testid={testId}
        role='alert'
        {...props}
      >
        <IconComp className={iconStyle} />
        <div>{children}</div>
      </div>
    </AlertContext.Provider>
  );
};

export interface IAlertSubComponents {
  Title: typeof AlertTitle;
  Message: typeof AlertMessage;
}

const AlertWithSubComponents = Alert as typeof Alert & IAlertSubComponents;

Alert.Title = AlertTitle;
Alert.Message = AlertMessage;

export default AlertWithSubComponents;
