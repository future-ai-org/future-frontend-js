import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/toggler.css";

export const Toggler: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`theme-toggler ${theme}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <div className="theme-toggler-track">
        <div className="theme-toggler-thumb">
          {theme === "light" ? "🌙" : "☀️"}
        </div>
      </div>
    </div>
  );
};
