import { css, cx } from '@emotion/css';
import { ThemeType } from '../../theme';
import { ButtonProps } from './Button';

const buttonSecondaryStyle = (
  theme: ThemeType,
  destructive: ButtonProps['destructive'],
  disabled: ButtonProps['disabled']
) => {
  const {
    color: { system, interaction },
    boxShadow,
  } = theme;

  const colour = destructive ? system.red70 : interaction.blue70;
  const hoverColour = destructive ? system.red100 : interaction.blue80;
  const activeColour = destructive ? system.red70 : interaction.blue70;
  const boxShadowActive = destructive
    ? boxShadow.destructiveActive
    : boxShadow.active;

  const secondaryBaseStyle = css`
    background-color: ${theme.color.neutral.white};
    color: ${colour};
    border: ${theme.border.b1} solid ${colour};
    font-weight: ${theme.font.weight.regular};
  `;

  const interactiveStyle = css`
    cursor: pointer;

    &:hover {
      background-color: ${theme.color.neutral.white};
      border-color: ${hoverColour};
      color: ${hoverColour};
    }

    &:active {
      background-color: ${theme.color.neutral.white};
      color: ${activeColour};
      border-color: ${activeColour};
      box-shadow: ${boxShadowActive};
    }
  `;

  const disabledStyle = css`
    border-color: ${theme.color.text.disabled};
    color: ${theme.color.text.disabled};
    cursor: not-allowed;
  `;

  return cx(
    secondaryBaseStyle,
    !disabled && interactiveStyle,
    disabled && disabledStyle
  );
};

export default buttonSecondaryStyle;
