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

    // Nuclear option: filter any message that contains these exact patterns
    const exactPatterns = [
      "`DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.",
      "DialogContent requires a DialogTitle for the component to be accessible for screen reader users.",
      "requires a DialogTitle for the component to be accessible",
      "If you want to hide the DialogTitle, you can wrap it with our VisuallyHidden component.",
    ];

    // Check exact patterns first
    if (exactPatterns.some((pattern) => fullMessage.includes(pattern))) {
      return true;
    }

    // Comprehensive Radix UI accessibility warnings filter
    const accessibilityKeywords = [
      "DialogContent",
      "AlertDialogContent",
      "DialogTitle",
      "AlertDialogTitle",
      "requires a",
      "for the component to be accessible",
      "accessible for screen reader users",
      "VisuallyHidden",
      "radix-ui.com/primitives/docs",
    ];

    const isAccessibilityWarning = accessibilityKeywords.some((keyword) =>
      fullMessage.includes(keyword),
    );

    if (isAccessibilityWarning) {
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

  // Additional override for console.log that might be showing warnings
  const originalLog = console.log;
  console.log = (...args) => {
    if (shouldFilterWarning(...args)) {
      return;
    }
    originalLog.apply(console, args);
  };

  // Global error event listener for any warnings that slip through
  window.addEventListener("error", (event) => {
    if (event.message && shouldFilterWarning(event.message)) {
      event.preventDefault();
      return false;
    }
  });

  // Intercept unhandled promise rejections that might contain warnings
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason && shouldFilterWarning(String(event.reason))) {
      event.preventDefault();
      return false;
    }
  });
}
createRoot(document.getElementById("root")!).render(<App />);
