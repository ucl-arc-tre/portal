import { css, cx } from '@emotion/css';
import { ThemeType } from '../../theme';
import { ButtonProps } from './Button';

const buttonTertiaryStyle = (
  theme: ThemeType,
  disabled: ButtonProps['disabled']
) => {
  const {
    color: { interaction },
  } = theme;

  const colour = interaction.blue70;
  const hoverColour = interaction.blue80;
  const activeColour = interaction.blue70;

  const tertiaryBaseStyle = css`
    border: none;
    background-color: transparent;
    color: ${colour};
    font-weight: ${theme.font.weight.bold};
  `;

  const interactiveStyle = css`
    cursor: pointer;

    &:hover {
      color: ${hoverColour};
    }

    &:active {
      color: ${activeColour};
    }
  `;

  const disabledStyle = css`
    color: ${theme.color.text.disabled};
    cursor: not-allowed;
  `;

  return cx(
    tertiaryBaseStyle,
    !disabled && interactiveStyle,
    disabled && disabledStyle
  );
};

export default buttonTertiaryStyle;
