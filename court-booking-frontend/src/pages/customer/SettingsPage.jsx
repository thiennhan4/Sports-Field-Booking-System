// src/pages/customer/SettingsPage.jsx

import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSettings } from "../../contexts/SettingsContext";
import { Settings, Bell, Shield, Moon, Sun, Globe, Check, AlertCircle } from "lucide-react";

export const SettingsPage = () => {
  const { user } = useAuth();
  const {
    darkMode,
    emailNotifications,
    language,
    isLoading,
    isSaving,
    updateSettings,
    saveSettings,
    t,
  } = useSettings();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSaveSettings = async () => {
    setSuccess(false);
    setError(null);
    try {
      await saveSettings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || t("settings.saveError"));
    }
  };

  if (!user) {
    return (
      <div className="max-w-md w-full mx-auto my-12 text-center glass-card p-8 rounded-3xl border theme-border">
        <Shield className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold theme-text mb-2">{t("settings.loginRequired")}</h2>
        <p className="theme-text-muted text-xs">{t("settings.loginRequiredDesc")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl w-full mx-auto my-12 text-center glass-card p-8 rounded-3xl border theme-border">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="theme-text-muted text-xs">{t("settings.loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto space-y-8 animate-fade-in">
      <div className="border-b theme-border pb-4">
        <h1 className="text-3xl font-extrabold theme-text">{t("settings.title")}</h1>
        <p className="theme-text-muted text-sm mt-1">{t("settings.subtitle")}</p>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-2 text-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>{t("settings.saveSuccess")}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-card p-8 rounded-3xl border theme-border space-y-6">
        {/* Appearance Section */}
        <div>
          <h3 className="text-lg font-bold theme-text mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            {t("settings.appearance")}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 theme-surface rounded-xl border theme-border">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-purple-400" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <p className="text-sm font-semibold theme-text">{t("settings.darkMode")}</p>
                  <p className="text-xs theme-text-muted">{t("settings.darkModeDesc")}</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={darkMode}
                onClick={() => updateSettings({ darkMode: !darkMode })}
                className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? "bg-indigo-600" : "bg-gray-400"}`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    darkMode ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="border-t theme-border pt-6">
          <h3 className="text-lg font-bold theme-text mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-400" />
            {t("settings.notifications")}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 theme-surface rounded-xl border theme-border">
              <div>
                <p className="text-sm font-semibold theme-text">{t("settings.emailNotifications")}</p>
                <p className="text-xs theme-text-muted">{t("settings.emailNotificationsDesc")}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={emailNotifications}
                onClick={() => updateSettings({ emailNotifications: !emailNotifications })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  emailNotifications ? "bg-indigo-600" : "bg-gray-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    emailNotifications ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Language Section */}
        <div className="border-t theme-border pt-6">
          <h3 className="text-lg font-bold theme-text mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            {t("settings.language")}
          </h3>

          <div className="space-y-4">
            <div className="p-4 theme-surface rounded-xl border theme-border">
              <p className="text-sm font-semibold theme-text mb-3">{t("settings.selectLanguage")}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateSettings({ language: "vi" })}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                    language === "vi"
                      ? "bg-indigo-600 text-white"
                      : "theme-btn-secondary"
                  }`}
                >
                  {t("settings.vietnamese")}
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ language: "en" })}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all ${
                    language === "en"
                      ? "bg-indigo-600 text-white"
                      : "theme-btn-secondary"
                  }`}
                >
                  {t("settings.english")}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t("settings.saving")}
            </>
          ) : (
            t("settings.save")
          )}
        </button>
      </div>
    </div>
  );
};
