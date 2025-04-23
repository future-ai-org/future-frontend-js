import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { injectColorVariables } from "./styles/colors";
import App from "./App";

const initialTheme = localStorage.getItem("theme") || "light";
injectColorVariables(initialTheme as "light" | "dark");

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
