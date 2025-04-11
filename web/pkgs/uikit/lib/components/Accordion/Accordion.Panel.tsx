import React, { HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import { useAccordionContext } from './Accordion';

export const NAME = 'ucl-accordion__panel';

interface AccordionPanelProps
  extends HTMLAttributes<HTMLDivElement> {
  testId?: string;
}

const AccordionPanel: React.FC<AccordionPanelProps> = ({
  children,
  className,
  testId = NAME,
}) => {
  const [theme] = useTheme();
  const { isOpen } = useAccordionContext();

  if (!isOpen) return null;

  const panelStyle = cx(
    NAME,

    css`
      padding: ${theme.padding.p16};
      font-family: ${theme.font.family.primary};
      font-weight: ${theme.font.weight.regular};
      background-color: ${theme.color.neutral.white};
      font-size: ${theme.font.size.f16};
      color: ${theme.color.text.primary};
    `,
    className
  );

  return (
    <div
      className={panelStyle}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export default AccordionPanel;
