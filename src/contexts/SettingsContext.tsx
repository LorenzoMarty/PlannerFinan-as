import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface UserSettings {
  // Appearance
  theme: "light" | "dark" | "system";
  primaryColor: string;
  font: string;
  fontSize: number;
  layout: "compact" | "default" | "spacious";
  highContrast: boolean;
  reducedMotion: boolean;

  // Notifications
  emailNotifications: boolean;
  collaborationNotifications: boolean;
  reminderNotifications: boolean;
  marketingEmails: boolean;
  pushNotifications: boolean;

  // Privacy & Security
  twoFactorAuth: boolean;
  dataSharing: boolean;
  analyticsTracking: boolean;
  sessionTimeout: number;

  // Accessibility
  screenReader: boolean;
  keyboardNavigation: boolean;
  voiceAnnouncements: boolean;
  largeButtons: boolean;

  // General
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

const defaultSettings: UserSettings = {
  theme: "light",
  primaryColor: "blue",
  font: "inter",
  fontSize: 16,
  layout: "default",
  highContrast: false,
  reducedMotion: false,
  emailNotifications: true,
  collaborationNotifications: true,
  reminderNotifications: false,
  marketingEmails: false,
  pushNotifications: true,
  twoFactorAuth: false,
  dataSharing: false,
  analyticsTracking: true,
  sessionTimeout: 30,
  screenReader: false,
  keyboardNavigation: true,
  voiceAnnouncements: false,
  largeButtons: false,
  language: "pt-BR",
  currency: "BRL",
  timezone: "America/Sao_Paulo",
  dateFormat: "DD/MM/YYYY",
  numberFormat: "1.234,56",
};

interface SettingsContextType {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("plannerfinSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else if (settings.theme === "light") {
      root.classList.remove("dark");
    } else {
      // System theme
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (mediaQuery.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    // Apply font size
    root.style.fontSize = `${settings.fontSize}px`;

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Apply large buttons
    if (settings.largeButtons) {
      root.classList.add("large-buttons");
    } else {
      root.classList.remove("large-buttons");
    }

    // Apply font family
    const fontMap: Record<string, string> = {
      inter: "Inter, system-ui, sans-serif",
      roboto: "Roboto, system-ui, sans-serif",
      opensans: "Open Sans, system-ui, sans-serif",
      lato: "Lato, system-ui, sans-serif",
      poppins: "Poppins, system-ui, sans-serif",
    };
    root.style.fontFamily = fontMap[settings.font] || fontMap.inter;

    // Apply layout density
    root.setAttribute("data-layout", settings.layout);
  }, [settings]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("plannerfinSettings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("plannerfinSettings");
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsJson: string): boolean => {
    try {
      const imported = JSON.parse(settingsJson);
      setSettings({ ...defaultSettings, ...imported });
      return true;
    } catch (error) {
      console.error("Error importing settings:", error);
      return false;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        exportSettings,
        importSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
