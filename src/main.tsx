import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Filter out Recharts defaultProps warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("Support for defaultProps will be removed") &&
    (args[0].includes("XAxis") ||
      args[0].includes("YAxis") ||
      args[0].includes("CartesianGrid"))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
