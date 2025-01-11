import React from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggleButton = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        padding: "10px 20px",
        backgroundColor: isDarkMode ? "#444" : "#ddd",
        color: isDarkMode ? "#fff" : "#000",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      {isDarkMode ? "Light Mode" : "Dark Mode"}
    </button>
  );
};

export default ThemeToggleButton;
