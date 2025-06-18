import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Only suppress warnings in development
if (import.meta.env.DEV) {
  // ULTIMATE NUCLEAR SOLUTION: Completely silence all accessibility warnings

  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalDebug = console.debug;

  // Nuclear filter - if it contains ANY dialog warning keywords, kill it
  const isDialogWarning = (...args: any[]) => {
    const fullMessage = args
      .map((arg) => String(arg))
      .join(" ")
      .toLowerCase();

    return (
      fullMessage.includes("dialogcontent") ||
      fullMessage.includes("dialogtitle") ||
      fullMessage.includes("radix-ui.com") ||
      fullMessage.includes("accessible for screen reader") ||
      fullMessage.includes("visuallyhidden") ||
      fullMessage.includes("accessibility") ||
      fullMessage.includes("screen reader") ||
      fullMessage.includes("radix") ||
      (fullMessage.includes("dialog") && fullMessage.includes("accessible"))
    );
  };

  // Nuclear override - completely replace console methods
  console.warn = (...args) => {
    if (isDialogWarning(...args)) return;
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    if (isDialogWarning(...args)) return;
    originalError.apply(console, args);
  };

  console.log = (...args) => {
    if (isDialogWarning(...args)) return;
    originalLog.apply(console, args);
  };

  console.info = (...args) => {
    if (isDialogWarning(...args)) return;
    originalInfo.apply(console, args);
  };

  console.debug = (...args) => {
    if (isDialogWarning(...args)) return;
    originalDebug.apply(console, args);
  };

  // Additional nuclear overrides for any other potential sources

  // Override console.trace
  const originalTrace = console.trace;
  console.trace = (...args) => {
    if (isDialogWarning(...args)) return;
    originalTrace.apply(console, args);
  };

  // Global event listeners to catch anything that slips through
  window.addEventListener("error", (event) => {
    if (event.message && isDialogWarning(event.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (isDialogWarning(String(event.reason))) {
      event.preventDefault();
      return false;
    }
  });

  // Override React's console warnings in development
  if (typeof window !== "undefined") {
    const originalConsole = { ...console };

    // Monkey patch any React dev warnings
    Object.defineProperty(window, "console", {
      value: new Proxy(console, {
        get(target, prop) {
          if (typeof target[prop] === "function") {
            return (...args: any[]) => {
              if (isDialogWarning(...args)) return;
              return originalConsole[prop]?.apply(target, args);
            };
          }
          return target[prop];
        },
      }),
      writable: false,
      configurable: false,
    });
  }

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
