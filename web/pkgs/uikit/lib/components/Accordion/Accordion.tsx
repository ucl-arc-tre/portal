import React, {
  createContext,
  useContext,
  useState,
  HTMLAttributes,
} from 'react';
import AccordionHeading from './Accordion.Heading';
import AccordionPanel from './Accordion.Panel';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';

export const NAME = 'ucl-accordion';

interface AccordionContextProps {
  isOpen: boolean;
  toggleAccordion: () => void;
  disabled: boolean;
  size: 'small' | 'medium';
}

const AccordionContext = createContext<
  AccordionContextProps | undefined
>(undefined);

export const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      'useAccordionContext must be used within an AccordionProvider'
    );
  }
  return context;
};

export interface AccordionProps
  extends HTMLAttributes<HTMLDivElement> {
  testId?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  isOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> & {
  Heading: typeof AccordionHeading;
  Panel: typeof AccordionPanel;
} = ({
  size = 'medium',
  disabled = false,
  isOpen = false,
  children,
  className,
  testId = NAME,
}) => {
  const [open, setOpen] = useState(isOpen);
  const [theme] = useTheme();

  const toggleAccordion = () => {
    if (!disabled) {
      setOpen((prev) => !prev);
    }
  };

  const accordionStyle = cx(
    NAME,
    css`
      max-width: 600px;
      border: 1px solid ${theme.color.neutral.grey10};
      background-color: ${theme.color.neutral.white};
      font-family: ${theme.font.family.primary};
      font-size: ${theme.font.size.f16};
    `,
    size === 'small' &&
      css`
        font-size: ${theme.font.size.f16};
        line-height: ${theme.height.h24};
      `,
    size === 'medium' &&
      css`
        font-size: ${theme.font.size.f20};
      `,
    disabled &&
      css`
        pointer-events: none;
        background-color: ${theme.color.link.disabled};
        color: ${theme.color.text.muted};
        // border-color: ${theme.color.text.muted};
      `,
    className
  );

  return (
    <AccordionContext.Provider
      value={{
        isOpen: open,
        toggleAccordion,
        disabled,
        size,
      }}
    >
      <div
        className={accordionStyle}
        aria-disabled={disabled}
        data-testid={testId}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

Accordion.Heading = AccordionHeading;
Accordion.Panel = AccordionPanel;

export default Accordion;
