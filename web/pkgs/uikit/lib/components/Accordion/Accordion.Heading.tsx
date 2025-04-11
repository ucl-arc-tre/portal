import React, { HTMLAttributes, JSX } from 'react';
import { css, cx } from '@emotion/css';
import useTheme from '../../theme/useTheme';
import Icon from '../Icon/Icon';
import { useAccordionContext } from './Accordion';

export const NAME = 'ucl-accordion__heading';

interface AccordionHeadingProps
  extends HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  testId?: string;
}

const AccordionHeading: React.FC<AccordionHeadingProps> = ({
  children,
  as: Component = 'div',
  testId = NAME,
  className,
}) => {
  const [theme] = useTheme();
  const { isOpen, toggleAccordion, disabled, size } =
    useAccordionContext();

  const headingStyle = cx(
    NAME,
    css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${theme.padding.p16};
      background-color: ${theme.color.neutral.white};
      cursor: ${disabled ? 'not-allowed' : 'pointer'};
      font-weight: ${theme.font.weight.bold};
      transition:
        background-color 0.3s ease,
        box-shadow 0.3s ease;

      &:hover {
        background-color: ${!disabled
          ? theme.color.neutral.grey5
          : theme.color.text.disabled};
      }

      &:focus-visible {
        outline: none;
        box-shadow: ${theme.boxShadow.focus};
      }
    `,
    className
  );

  return (
    <Component
      className={headingStyle}
      data-testid={testId}
      onClick={!disabled ? toggleAccordion : undefined}
      role='button'
      tabIndex={0}
      aria-expanded={isOpen}
    >
      {children}
      <Icon.ChevronDown
        size={size === 'medium' ? 32 : 24}
        className={css`
          transform: rotate(${isOpen ? '180deg' : '0deg'});
          transition: transform 0.15s ease;
          color: ${theme.color.interaction.blue70};
        `}
      />
    </Component>
  );
};

export default AccordionHeading;
