/**
 * src/context/ThemeContext.jsx
 *
 * Global dark / light theme context.
 * Persists preference to localStorage and applies a "light" class to <body>.
 */

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("jp_theme");
      return saved === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (theme === "light") {
      html.classList.add("light");
      html.classList.remove("dark");
      body.classList.add("light");
      body.classList.remove("dark");
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
      body.classList.remove("light");
      body.classList.add("dark");
    }
    try {
      localStorage.setItem("jp_theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
