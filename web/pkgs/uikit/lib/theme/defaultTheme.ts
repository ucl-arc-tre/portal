// UCL Theme

// base colours

const purple200 = '#2C0442'; // UCL dark purple
const purple50 = '#500778'; // UCL vibrant purple
const purple40 = '#6345A5';
const purple20 = '#BBAACC';
// TODO: where is UCL muted purple = #C6B0BC ?
const green100 = '#006B0F';
const green70 = '#008613';
const green40 = '#80C289';
const green10 = '#E6F3E8';
const green200 = '#113B3A'; // UCL dark green
const green50 = '#52C152'; // UCL vibrant green
const green20 = '#C9D1A8'; // UCL muted green

const blue100 = '#004089';
const blue80 = '#004EA8';
const blue70 = '#0D68CF';
const blue40 = '#7FB7F7';
const blue10 = '#E5F0FD';
const blue5 = '#F2F8FE';
const blue200 = '#002248'; // UCL dark blue
const blue50 = '#34C6C6'; // UCL vibrant blue
const blue20 = '#B6DCE5'; // UCL muted blue

const yellow200 = '#504D48'; // UCL dark yellow
const yellow50 = '#FFCA36'; // UCL vibrant yellow
const yellow20 = '#DAD6CA'; // UCL muted yellow

const orange100 = '#CC7100';
const orange70 = '#FF8D00';
const orange40 = '#FFC680';
const orange10 = '#FFF4E6';

const red100 = '#811712';
const red70 = '#CA0007';
const red50 = '#E48083';
const red40 = '#E48083';
const red10 = '#FAE6E7';

const pink200 = '#4B0A32'; // UCL dark pink
const pink50 = '#AC145A'; // UCL vibrant pink
const pink20 = '#DEB8C3'; // UCL vibrant pink

const black100 = '#000000';
const black90 = '#1A1A1A';
const black80 = '#333333';
const black60 = '#666666';
const black40 = '#999999';
const black20 = '#CCCCCC';
const black15 = '#D9D9D9';
const black10 = '#E6E6E6';
const black5 = '#F2F2F2';

const white = '#ffffff';

const baseColour = {
  purple200,
  purple50,
  purple40,
  purple20,

  green100,
  green70,
  green40,
  green10,
  green200,
  green50,
  green20,

  blue100,
  blue80,
  blue70,
  blue40,
  blue10,
  blue5,
  blue200,
  blue50,
  blue20,

  yellow200,
  yellow50,
  yellow20,

  orange100,
  orange70,
  orange40,
  orange10,
  // missing orange50?
  red100,
  red70,
  red50,
  red40,
  red10,

  pink200,
  pink50,
  pink20,

  black100,
  black90,
  black80,
  black60,
  black40,
  black20,
  black15,
  black10,
  black5,

  white,
};

const textColours = {
  primary: baseColour.black90, // Primary text, such as body copy, headers, displays, labels.
  secondary: baseColour.black60, // Secondary text, such as stand-first, paragraph summary, breadcrumbs.
  muted: baseColour.black40, // Tertiary text, such as input fields placeholder.
  inverted: baseColour.white, // Text on bold background, for example primary buttons label.

  interactive: baseColour.blue70, // Link, secondary button.
  default: baseColour.black60, // Status default for component label: tabs, toolbar.
  disabledOnBg: baseColour.black40, // Status disabled on background.
  disabled: baseColour.black20, // Status disabled.

  active: baseColour.blue70, // Status active for components' label: tabs, toolbar.
  hover: baseColour.blue100, // Status hover for links and components' label.
  visited: baseColour.purple40, // Status visited for links.

  error: baseColour.red70, // Label for buttons or link with destructive purpose.
  errorHover: baseColour.red100, // Error hover.
  errorDisabled: baseColour.red50, // Error disabled.
};

const interactionColours = {
  blue100: baseColour.blue100,
  blue80: baseColour.blue80,
  blue70: baseColour.blue70,
  blue40: baseColour.blue40,
  blue10: baseColour.blue10,
  blue5: baseColour.blue5,
};

const displayColours = {
  purpleDark: baseColour.purple200,
  purpleVibrant: baseColour.purple50,
  purpleMuted: baseColour.purple20,

  greenDark: baseColour.green200,
  greenVibrant: baseColour.green50,
  greenMuted: baseColour.green20,

  yellowDark: baseColour.yellow200,
  yellowVibrant: baseColour.yellow50,
  yellowMuted: baseColour.yellow20,

  pinkDark: baseColour.pink200,
  pinkVibrant: baseColour.pink50,
  pinkMuted: baseColour.pink20,

  blueDark: baseColour.blue200,
  blueVibrant: baseColour.blue50,
  blueMuted: baseColour.blue20,
};

const systemColours = {
  red100: baseColour.red100,
  red70: baseColour.red70,
  red40: baseColour.red40,
  red10: baseColour.red10,

  orange100: baseColour.orange100,
  orange70: baseColour.orange70,
  orange40: baseColour.orange40,
  orange10: baseColour.orange10,

  green100: baseColour.green100,
  green70: baseColour.green70,
  green40: baseColour.green40,
  green10: baseColour.green10,

  blue100: baseColour.blue100,
  blue80: baseColour.blue80,
  blue70: baseColour.blue70,
  blue40: baseColour.blue40,
  blue10: baseColour.blue10,
  blue5: baseColour.blue5,
};

const linkColours = {
  default: baseColour.blue70,
  hover: baseColour.blue100,
  visited: baseColour.purple40,
  disabled: baseColour.black20,
};

const blackAndWhite = {
  black: baseColour.black100,
  white: baseColour.white,
};

const neutralColours = {
  black: blackAndWhite.black,
  grey90: baseColour.black90,
  grey80: baseColour.black80,
  grey60: baseColour.black60,
  grey40: baseColour.black40,
  grey20: baseColour.black20,
  grey15: baseColour.black15,
  grey10: baseColour.black10,
  grey5: baseColour.black5,
  white: blackAndWhite.white,
};

const overlayColours = {
  blanket: 'rgba(0, 0, 0, 0.5)',
};

const color = {
  text: textColours,
  interaction: interactionColours,
  display: displayColours,
  system: systemColours,
  link: linkColours,
  neutral: neutralColours,
  overlay: overlayColours,
};

// These colour definitions will need to be refactored to match the design system.

const baseSizes = {
  s1: '1px',
  s2: '2px',
  s4: '4px',
  s6: '6px',
  s8: '8px',
  s12: '12px',
  s16: '16px',
  s20: '20px',
  s24: '24px',
  s28: '28px',
  s32: '32px',
  s36: '36px',
  s40: '40px',
  s44: '44px',
  s48: '48px',
  s52: '52px',
  s56: '56px',
  s60: '60px',
  s64: '64px',
  s80: '80px',
};

const margin = {
  m2: baseSizes.s2,
  m4: baseSizes.s4,
  m6: baseSizes.s6,
  m8: baseSizes.s8,
  m12: baseSizes.s12,
  m16: baseSizes.s16,
  m20: baseSizes.s20,
  m24: baseSizes.s24,
  m32: baseSizes.s32,
  m40: baseSizes.s40,
  m48: baseSizes.s48,
  m56: baseSizes.s56,
  m64: baseSizes.s64,
};

const padding = {
  p2: baseSizes.s2,
  p4: baseSizes.s4,
  p6: baseSizes.s6,
  p8: baseSizes.s8,
  p12: baseSizes.s12,
  p16: baseSizes.s16,
  p20: baseSizes.s20,
  p24: baseSizes.s24,
  p32: baseSizes.s32,
  p40: baseSizes.s40,
  p48: baseSizes.s48,
  p56: baseSizes.s56,
  p64: baseSizes.s64,
};

const breakpoints = {
  mobile: 320,
  tablet: 672,
  desktop: 1056,
  desktopLarge: 1536,
};

const createMediaQuery = (breakpoint: number) =>
  // Breakpoints apply at the specified width and above
  `@media (min-width: ${breakpoint}px)`;

const custom = (breakpoint: number) =>
  // Fallback for edge cases
  createMediaQuery(breakpoint);

const mq = {
  mobile: createMediaQuery(breakpoints.mobile),
  tablet: createMediaQuery(breakpoints.tablet),
  desktop: createMediaQuery(breakpoints.desktop),
  desktopLarge: createMediaQuery(breakpoints.desktopLarge),
  custom,
};

const theme = {
  color,

  thickness: {
    t1: baseSizes.s1,
    t2: baseSizes.s2,
  },

  width: {
    h16: baseSizes.s16,
    h20: baseSizes.s20,
    h24: baseSizes.s24,
  },

  height: {
    h16: baseSizes.s16,
    h20: baseSizes.s20,
    h24: baseSizes.s24,
    h32: baseSizes.s32,
    h36: baseSizes.s36,
    h40: baseSizes.s40,
    h80: baseSizes.s80,
  },

  margin,

  padding,

  radius: {
    r2: baseSizes.s2,
    r4: baseSizes.s4,
    r8: baseSizes.s8,
    r12: baseSizes.s12,
    r16: baseSizes.s16,
  },

  border: {
    b1: baseSizes.s1,
    b2: baseSizes.s2,
  },

  outline: {
    o2: baseSizes.s2,
    o4: baseSizes.s4,
  },

  font: {
    family: {
      primary: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
      secondary:
        'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif',
      fixed: 'Courier, fixed',
    },
    size: {
      f12: '12px',
      f14: '14px', // Font should be at least 14px in most cases
      f16: '16px', // Prefer 16px to 14px in most cases
      f18: '18px',
      f20: '20px',
      f22: '22px',
      f24: '24px',
      f26: '26px',
      f28: '28px',
      f30: '30px',
      f32: '32px',
      f36: '36px',
      f40: '40px',
    },
    weight: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
      extraBold: 800,
    },
    lineHeight: {
      h100: '100%',
      h110: '110%',
      h120: '120%',
      h130: '130%',
      h140: '140%',
      h150: '150%',
    },
  },

  boxShadow: {
    // offset-x | offset-y | blur-radius | spread-radius | color
    y1: '0 1px 4px 1px rgba(0, 0, 0, 0.1)',
    y2: '0 2px 4px 1px rgba(0, 0, 0, 0.1)',
    x2y4: '2px 4px 8px 4px rgba(0, 0, 0, 0.1)',
    focus: `0px 0px 0px 2px ${color.neutral.white}, 0px 0px 0px 4px ${color.neutral.black}, 0px 0px 0px 6px ${color.system.orange70}`,
    active: `0px 6px 0px 0px ${color.interaction.blue80} inset`,
    destructiveActive: `0px 6px 0px 0px ${color.system.red100} inset`,
  },

  breakpoints,
  mq,

  // For ease of use, margin and padding are added at the top level
  // Usage: margin-top: ${theme.m16};
  ...margin,
  ...padding,
};

export type ThemeType = typeof theme;
export type DisplayColoursType = typeof displayColours;
export type BlackAndWhiteColoursType = typeof blackAndWhite;

export default theme;
