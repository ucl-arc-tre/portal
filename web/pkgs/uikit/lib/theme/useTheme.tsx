// We will probably move away from context/provider to store/hook for accessing theme.

import {
  createContext,
  useState,
  useContext,
  ReactNode,
} from 'react';

import theme, { ThemeType } from './defaultTheme';

const useThemeState = () => useState(theme as ThemeType);

const ThemeContext = createContext<ReturnType<
  typeof useThemeState
> | null>(null);

export const ThemeContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => (
  <ThemeContext.Provider value={useThemeState()}>
    {children}
  </ThemeContext.Provider>
);

const useTheme = () => {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error('Please add ThemeContextProvider');
  }
  return value;
};

export default useTheme;
