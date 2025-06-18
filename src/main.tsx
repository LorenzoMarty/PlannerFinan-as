import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Completely suppress Recharts defaultProps warnings
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  // Convert all arguments to strings for checking
  const message = args.map((arg) => String(arg)).join(" ");

  // Filter out defaultProps warnings
  if (message.includes("Support for defaultProps will be removed")) {
    return;
  }

  // Filter out any Recharts-related warnings
  if (
    message.includes("XAxis") ||
    message.includes("YAxis") ||
    message.includes("CartesianGrid") ||
    message.includes("Tooltip") ||
    message.includes("Legend") ||
    message.includes("recharts")
  ) {
    return;
  }

  originalWarn.apply(console, args);
};

console.error = (...args) => {
  // Convert all arguments to strings for checking
  const message = args.map((arg) => String(arg)).join(" ");

  // Filter out defaultProps errors
  if (message.includes("Support for defaultProps will be removed")) {
    return;
  }

  originalError.apply(console, args);
};

createRoot(document.getElementById("root")!).render(<App />);
