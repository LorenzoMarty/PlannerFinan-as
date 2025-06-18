import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Filter out Recharts defaultProps warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  // Check if any argument contains the defaultProps warning
  const hasDefaultPropsWarning = args.some(
    (arg) =>
      typeof arg === "string" &&
      arg.includes("Support for defaultProps will be removed"),
  );

  const hasRechartsComponent = args.some(
    (arg) =>
      typeof arg === "string" &&
      (arg.includes("XAxis") ||
        arg.includes("YAxis") ||
        arg.includes("CartesianGrid") ||
        arg.includes("Tooltip") ||
        arg.includes("Legend")),
  );

  if (hasDefaultPropsWarning && hasRechartsComponent) {
    return;
  }

  originalWarn.apply(console, args);
};

createRoot(document.getElementById("root")!).render(<App />);
