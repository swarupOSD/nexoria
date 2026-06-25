import React, { createContext, useState, useEffect, useContext } from 'react';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  const [isCyberpunk, setIsCyberpunk] = useState(() => {
    return localStorage.getItem('cyberpunk') === 'true';
  });

  const { data: settingsRes } = useGetSettingsQuery();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isCyberpunk) {
      document.documentElement.setAttribute('data-theme', 'cyberpunk');
      localStorage.setItem('cyberpunk', 'true');
    } else {
      localStorage.setItem('cyberpunk', 'false');
      if (settingsRes?.data?.theme) {
        document.documentElement.setAttribute('data-theme', settingsRes.data.theme);
      } else {
        document.documentElement.setAttribute('data-theme', 'royal-purple');
      }
    }
  }, [isCyberpunk, settingsRes]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const toggleCyberpunk = () => setIsCyberpunk((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isCyberpunk, toggleCyberpunk }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
