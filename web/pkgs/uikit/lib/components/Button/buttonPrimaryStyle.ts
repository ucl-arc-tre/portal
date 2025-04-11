import { css, cx } from '@emotion/css';
import { ThemeType } from '../../theme';
import { ButtonProps } from './Button';

const buttonPrimaryStyle = (
  theme: ThemeType,
  destructive: ButtonProps['destructive'],
  disabled: ButtonProps['disabled']
) => {
  const {
    color: { system, interaction },
    boxShadow,
  } = theme;

  const bgColour = destructive ? system.red70 : interaction.blue70;
  const bgHoverColour = destructive ? system.red100 : interaction.blue80;
  const bgActiveColour = destructive ? system.red70 : interaction.blue70;
  const boxShadowActive = destructive
    ? boxShadow.destructiveActive
    : boxShadow.active;

  const primaryBaseStyle = css`
    border: none;
    background-color: ${bgColour};
    color: ${theme.color.neutral.white};
    font-weight: ${theme.font.weight.bold};
  `;

  const interactiveStyle = css`
    cursor: pointer;

    &:hover {
      background-color: ${bgHoverColour};
    }

    &:active {
      background-color: ${bgActiveColour};
      box-shadow: ${boxShadowActive};
    }
  `;

  const disabledStyle = css`
    border-color: ${theme.color.text.disabled};
    background-color: ${theme.color.link.disabled};
    color: ${theme.color.text.disabledOnBg};
    cursor: not-allowed;
  `;

  return cx(
    primaryBaseStyle,
    !disabled && interactiveStyle,
    disabled && disabledStyle
  );
};

export default buttonPrimaryStyle;
