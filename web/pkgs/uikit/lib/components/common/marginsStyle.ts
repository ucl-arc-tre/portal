import { css, cx } from '@emotion/css';
import { ThemeType } from '../../theme';

export interface MarginProps {
  m?: keyof ThemeType['margin'];
  mv?: keyof ThemeType['margin'];
  mh?: keyof ThemeType['margin'];
  mt?: keyof ThemeType['margin'];
  mb?: keyof ThemeType['margin'];
  ml?: keyof ThemeType['margin'];
  mr?: keyof ThemeType['margin'];
  noMargins?: boolean;
}

const marginsStyle = (marginProps: MarginProps, theme: ThemeType) => {
  const { m, mv, mh, mt, mb, ml, mr, noMargins } = marginProps;

  if (noMargins) {
    return css`
      margin: 0;
    `;
  } else {
    return cx(
      m &&
        css`
          margin: ${theme.margin[m]};
        `,
      mv &&
        css`
          margin-top: ${theme.margin[mv]};
          margin-bottom: ${theme.margin[mv]};
        `,
      mh &&
        css`
          margin-left: ${theme.margin[mh]};
          margin-right: ${theme.margin[mh]};
        `,
      mt &&
        css`
          margin-top: ${theme.margin[mt]};
        `,
      mb &&
        css`
          margin-bottom: ${theme.margin[mb]};
        `,
      ml &&
        css`
          margin-left: ${theme.margin[ml]};
        `,
      mr &&
        css`
          margin-right: ${theme.margin[mr]};
        `
    );
  }
};

export default marginsStyle;
