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

export const formatDate = (
  date: Date | string,
  settings: UserSettings,
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (settings.dateFormat === "DD/MM/YYYY") {
    return dateObj.toLocaleDateString("pt-BR");
  } else if (settings.dateFormat === "MM/DD/YYYY") {
    return dateObj.toLocaleDateString("en-US");
  } else if (settings.dateFormat === "YYYY-MM-DD") {
    return dateObj.toISOString().split("T")[0];
  }

  return dateObj.toLocaleDateString();
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
