import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useTheme = () => {
  const { theme, toggleTheme } = useContext(AppContext);
  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  };
};
