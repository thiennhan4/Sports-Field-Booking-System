import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { settingsService } from "../services/settings.service";
import { t as translate } from "../i18n/translations";

const STORAGE_KEYS = {
  darkMode: "darkMode",
  notifications: "emailNotifications",
  language: "language",
};

const SettingsContext = createContext(null);

const readLocalSettings = () => ({
  darkMode: localStorage.getItem(STORAGE_KEYS.darkMode) !== "false",
  emailNotifications: localStorage.getItem(STORAGE_KEYS.notifications) !== "false",
  language: localStorage.getItem(STORAGE_KEYS.language) || "vi",
});

const persistLocalSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.darkMode, String(settings.darkMode));
  localStorage.setItem(STORAGE_KEYS.notifications, String(settings.emailNotifications));
  localStorage.setItem(STORAGE_KEYS.language, settings.language);
};

const applyTheme = (darkMode) => {
  document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  document.documentElement.classList.toggle("dark", darkMode);
  document.documentElement.classList.toggle("light", !darkMode);
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(readLocalSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const syncFromServer = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setIsLoading(true);
    try {
      const serverSettings = await settingsService.getSettings();
      const merged = {
        darkMode: serverSettings.darkMode ?? true,
        emailNotifications: serverSettings.emailNotifications ?? true,
        language: serverSettings.language || "vi",
      };
      setSettings(merged);
      persistLocalSettings(merged);
    } catch {
      // Keep local settings if API fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    applyTheme(settings.darkMode);
    document.documentElement.lang = settings.language;
  }, [settings.darkMode, settings.language]);

  useEffect(() => {
    syncFromServer();

    const handleAuthChange = () => syncFromServer();
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, [syncFromServer]);

  const updateSettings = (partial) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      persistLocalSettings(next);
      return next;
    });
  };

  const saveSettings = async (overrides = {}) => {
    const payload = { ...settings, ...overrides };
    setIsSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const saved = await settingsService.updateSettings(payload);
        const merged = {
          darkMode: saved.darkMode,
          emailNotifications: saved.emailNotifications,
          language: saved.language,
        };
        setSettings(merged);
        persistLocalSettings(merged);
        return merged;
      }
      setSettings(payload);
      persistLocalSettings(payload);
      return payload;
    } finally {
      setIsSaving(false);
    }
  };

  const t = (key) => translate(settings.language, key);

  return (
    <SettingsContext.Provider
      value={{
        darkMode: settings.darkMode,
        emailNotifications: settings.emailNotifications,
        language: settings.language,
        isLoading,
        isSaving,
        updateSettings,
        saveSettings,
        syncFromServer,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
};
