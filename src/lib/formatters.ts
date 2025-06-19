import { UserSettings } from "@/contexts/SettingsContext";

export const formatCurrency = (
  amount: number,
  settings: UserSettings,
): string => {
  const currencyMap: Record<string, string> = {
    BRL: "pt-BR",
    USD: "en-US",
    EUR: "de-DE",
  };

  const locale = currencyMap[settings.currency] || "pt-BR";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: settings.currency,
  }).format(amount);
};

// Simple date formatter without settings (for backwards compatibility)
export const formatDate = (date: Date | string): string => {
  return formatDateWithSettings(date);
};

// Full date formatter with settings
export const formatDateWithSettings = (
  date: Date | string,
  settings?: UserSettings,
): string => {
  // Handle string dates properly to avoid timezone issues
  let dateObj: Date;

  if (typeof date === "string") {
    // If it's already in YYYY-MM-DD format, parse it as local date
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split("-").map(Number);
      dateObj = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }

  if (!settings) {
    return dateObj.toLocaleDateString("pt-BR");
  }

  if (settings.dateFormat === "DD/MM/YYYY") {
    return dateObj.toLocaleDateString("pt-BR");
  } else if (settings.dateFormat === "MM/DD/YYYY") {
    return dateObj.toLocaleDateString("en-US");
  } else if (settings.dateFormat === "YYYY-MM-DD") {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return dateObj.toLocaleDateString("pt-BR");
};

export const formatNumber = (
  number: number,
  settings: UserSettings,
): string => {
  if (settings.numberFormat === "1.234,56") {
    return number.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (settings.numberFormat === "1,234.56") {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (settings.numberFormat === "1 234,56") {
    return number.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return number.toString();
};

export const getThemeClasses = (settings: UserSettings): string => {
  const classes = [];

  if (settings.highContrast) classes.push("high-contrast");
  if (settings.reducedMotion) classes.push("reduce-motion");
  if (settings.largeButtons) classes.push("large-buttons");

  return classes.join(" ");
};
