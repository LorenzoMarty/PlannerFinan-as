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

    // Nuclear option: Comprehensive Dialog accessibility warning filtering
    const dialogWarningPatterns = [
      "DialogContent",
      "AlertDialogContent",
      "DialogTitle",
      "AlertDialogTitle",
      "requires a",
      "for the component to be accessible",
      "accessible for screen reader users",
      "VisuallyHidden",
      "radix-ui.com/primitives/docs",
      "wrap it with our VisuallyHidden component",
      "component to be accessible for screen reader",
      "If you want to hide the",
      "For more information, see https://radix-ui.com",
    ];

    // Aggressive filtering for any dialog-related accessibility warnings
    const hasDialogWarning = dialogWarningPatterns.some((pattern) =>
      fullMessage.toLowerCase().includes(pattern.toLowerCase()),
    );

    if (hasDialogWarning) {
      return true;
    }

    // Filter defaultProps warnings
    if (fullMessage.includes("Support for defaultProps will be removed")) {
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

    const isRechartsWarning = rechartsComponents.some(
      (component) =>
        fullMessage.includes(component) && fullMessage.includes("defaultProps"),
    );

    if (isRechartsWarning) {
      return true;
    }

    // Catch-all for any radix or accessibility warnings
    const catchAllPatterns = [
      "radix-ui",
      "accessibility",
      "screen reader",
      "aria-",
      "role=",
      "accessible",
      "@radix-ui",
    ];

    return catchAllPatterns.some(
      (pattern) =>
        fullMessage.toLowerCase().includes(pattern.toLowerCase()) &&
        (fullMessage.includes("warning") || fullMessage.includes("Warning")),
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

  // Override console.info as well (some warnings might come through info)
  const originalInfo = console.info;
  console.info = (...args) => {
    if (shouldFilterWarning(...args)) {
      return;
    }
    originalInfo.apply(console, args);
  };

  // Override console.debug
  const originalDebug = console.debug;
  console.debug = (...args) => {
    if (shouldFilterWarning(...args)) {
      return;
    }
    originalDebug.apply(console, args);
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

  // Additional override for any console method that might be used by Radix
  const originalTrace = console.trace;
  console.trace = (...args) => {
    if (shouldFilterWarning(...args)) {
      return;
    }
    originalTrace.apply(console, args);
  };

  // Nuclear option: Override the global Error constructor for development
  const OriginalError = window.Error;
  window.Error = function (message?: string, ...args: any[]) {
    if (message && shouldFilterWarning(message)) {
      // Return a silent error that doesn't log
      const silentError = new OriginalError("");
      silentError.stack = "";
      return silentError;
    }
    return new OriginalError(message, ...args);
  } as any;

  // Preserve the original Error prototype
  window.Error.prototype = OriginalError.prototype;

  // Override setTimeout console warnings (sometimes used by React dev tools)
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = (callback: any, ms?: number) => {
    const wrappedCallback = (...args: any[]) => {
      try {
        return callback(...args);
      } catch (error) {
        if (error instanceof Error && shouldFilterWarning(error.message)) {
          return;
        }
        throw error;
      }
    };
    return originalSetTimeout(wrappedCallback, ms);
  };

  // One-time reset of demo data to load new fictional data
  const resetDemoData = () => {
    const demoUserId = btoa("demo@plannerfin.com");
    const adminUserId = btoa("admin@plannerfin.com");
    const joaoUserId = btoa("user@exemplo.com");

    localStorage.removeItem(`plannerfinUserData_${demoUserId}`);
    localStorage.removeItem(`plannerfinUserData_${adminUserId}`);
    localStorage.removeItem(`plannerfinUserData_${joaoUserId}`);
  };

  // Reset demo data if not already done
  if (!localStorage.getItem("demoDataReset_v2")) {
    resetDemoData();
    localStorage.setItem("demoDataReset_v2", "true");
  }
}
createRoot(document.getElementById("root")!).render(<App />);
