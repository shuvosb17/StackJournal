"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_READING_SETTINGS,
  READING_SETTINGS_KEY,
  type FontSize,
  type LineHeight,
  type ReadingSettings,
  type ReadingTheme,
  type ReadingWidth,
} from "@/lib/reader/types";

type ReadingSettingsContextValue = {
  settings: ReadingSettings;
  setFontSize: (size: FontSize) => void;
  setLineHeight: (height: LineHeight) => void;
  setWidth: (width: ReadingWidth) => void;
  setTheme: (theme: ReadingTheme) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
};

const fontSizes: FontSize[] = ["sm", "md", "lg", "xl"];

const ReadingSettingsContext =
  createContext<ReadingSettingsContextValue | null>(null);

function loadSettings(): ReadingSettings {
  if (typeof window === "undefined") return DEFAULT_READING_SETTINGS;
  try {
    const raw = localStorage.getItem(READING_SETTINGS_KEY);
    if (!raw) return DEFAULT_READING_SETTINGS;
    return { ...DEFAULT_READING_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_READING_SETTINGS;
  }
}

export function ReadingSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_READING_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(READING_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, ready]);

  const update = useCallback((patch: Partial<ReadingSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const increaseFontSize = useCallback(() => {
    setSettings((prev) => {
      const idx = fontSizes.indexOf(prev.fontSize);
      return { ...prev, fontSize: fontSizes[Math.min(idx + 1, fontSizes.length - 1)] };
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setSettings((prev) => {
      const idx = fontSizes.indexOf(prev.fontSize);
      return { ...prev, fontSize: fontSizes[Math.max(idx - 1, 0)] };
    });
  }, []);

  const value = useMemo(
    () => ({
      settings,
      setFontSize: (fontSize: FontSize) => update({ fontSize }),
      setLineHeight: (lineHeight: LineHeight) => update({ lineHeight }),
      setWidth: (width: ReadingWidth) => update({ width }),
      setTheme: (theme: ReadingTheme) => update({ theme }),
      increaseFontSize,
      decreaseFontSize,
    }),
    [settings, update, increaseFontSize, decreaseFontSize],
  );

  return (
    <ReadingSettingsContext.Provider value={value}>
      {children}
    </ReadingSettingsContext.Provider>
  );
}

export function useReadingSettings() {
  const ctx = useContext(ReadingSettingsContext);
  if (!ctx) {
    throw new Error("useReadingSettings must be used within ReadingSettingsProvider");
  }
  return ctx;
}
