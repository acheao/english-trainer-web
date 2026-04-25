import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Locale = "en" | "zh-CN";

type I18nContextValue = {
  locale: Locale;
  isZh: boolean;
  setLocale: (locale: Locale) => void;
  formatDateTime: (value: string | number | Date) => string;
  formatDate: (value: string | number | Date) => string;
  formatNumber: (value: number) => string;
};

const STORAGE_KEY = "english_trainer_locale";
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function isSupportedLocale(value: string | null): value is Locale {
  return value === "en" || value === "zh-CN";
}

function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (isSupportedLocale(stored)) {
    return stored;
  }

  const browserLocale = navigator.languages?.[0] ?? navigator.language;
  return browserLocale.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const formatDateTime = useCallback(
    (value: string | number | Date) =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value)),
    [locale]
  );

  const formatDate = useCallback(
    (value: string | number | Date) =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
      }).format(new Date(value)),
    [locale]
  );

  const formatNumber = useCallback((value: number) => new Intl.NumberFormat(locale).format(value), [locale]);

  const value = useMemo(
    () => ({
      locale,
      isZh: locale === "zh-CN",
      setLocale,
      formatDateTime,
      formatDate,
      formatNumber,
    }),
    [formatDate, formatDateTime, formatNumber, locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
