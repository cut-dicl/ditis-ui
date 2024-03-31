// ThemeContext.js
import { createContext, useContext, useState } from 'react';
import Head from 'next/head';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [primeTheme, setPrimeTheme] = useState('lara-light-blue'); // 'default' is the initial theme

  const changeTheme = (newTheme) => {
    setPrimeTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ primeTheme, changeTheme }}>
      
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
