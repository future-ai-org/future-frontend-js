"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import "../styles/toggler.css";
import strings from "../i18n/themeContext.json";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(strings.en.errors.useThemeContext);
  }
  return context;
};

export const ThemeToggler: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`theme-toggler ${theme}`}
      onClick={toggleTheme}
      aria-label={
        theme === "light"
          ? strings.en.aria.switchToDark
          : strings.en.aria.switchToLight
      }
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && toggleTheme()}
    >
      <div className="theme-toggler-track">
        <div className="theme-toggler-thumb">
          {theme === "light" ? strings.en.icons.moon : strings.en.icons.sun}
        </div>
      </div>
    </div>
  );
};
