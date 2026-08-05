export type ReadingTheme = "light" | "dark" | "warm" | "oled" | "sepia";
export type FontSize = "sm" | "md" | "lg" | "xl";
export type LineHeight = "compact" | "normal" | "relaxed";
export type ReadingWidth = "narrow" | "default" | "wide";

export type ReadingSettings = {
  fontSize: FontSize;
  lineHeight: LineHeight;
  width: ReadingWidth;
  theme: ReadingTheme;
};

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
  fontSize: "md",
  lineHeight: "relaxed",
  width: "default",
  theme: "warm",
};

export const READING_SETTINGS_KEY = "stackjournal:reading-settings";
export const BOOKMARKS_KEY = "stackjournal:bookmarks";
export const PROGRESS_KEY = "stackjournal:reading-progress";
