import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Only suppress warnings in development
if (import.meta.env.DEV) {
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;

  // Comprehensive warning filter
  const shouldFilterWarning = (...args: any[]) => {
    const fullMessage = args
      .map((arg) => {
        if (typeof arg === "string") return arg;
        if (typeof arg === "object" && arg !== null) {
          return JSON.stringify(arg);
        }
        return String(arg);
      })
      .join(" ");

    // Filter defaultProps warnings
    if (fullMessage.includes("Support for defaultProps will be removed")) {
      return true;
    }

    // Filter DialogTitle accessibility warnings from third-party libraries
    if (
      (fullMessage.includes("DialogContent") ||
        fullMessage.includes("AlertDialogContent")) &&
      fullMessage.includes("requires a") &&
      (fullMessage.includes("DialogTitle") ||
        fullMessage.includes("AlertDialogTitle"))
    ) {
      return true;
    }

    // Filter accessibility warnings from Radix UI components
    if (
      fullMessage.includes("VisuallyHidden") &&
      fullMessage.includes("accessibility")
    ) {
      return true;
    }

    // Filter any Radix UI accessibility warnings
    if (
      fullMessage.includes("accessible for screen reader users") ||
      fullMessage.includes("radix-ui.com/primitives/docs") ||
      fullMessage.includes("for the component to be accessible")
    ) {
      return true;
    }

    // Filter dropdown menu accessibility warnings
    if (
      fullMessage.includes("DropdownMenu") &&
      fullMessage.includes("accessibility")
    ) {
      return true;
    }

    // Filter Select component accessibility warnings
    if (
      fullMessage.includes("SelectContent") &&
      fullMessage.includes("accessibility")
    ) {
      return true;
    }

    // Filter Recharts component warnings
    const rechartsComponents = [
      "XAxis",
      "YAxis",
      "CartesianGrid",
      "Tooltip",
      "Legend",
      "BarChart",
      "LineChart",
      "PieChart",
      "AreaChart",
      "Bar",
      "Line",
      "Pie",
      "Area",
      "Cell",
    ];

    return rechartsComponents.some(
      (component) =>
        fullMessage.includes(component) && fullMessage.includes("defaultProps"),
    );
  };

  console.warn = (...args) => {
    if (shouldFilterWarning(...args)) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    if (shouldFilterWarning(...args)) {
      return;
    }
    originalError.apply(console, args);
  };
}
createRoot(document.getElementById("root")!).render(<App />);
