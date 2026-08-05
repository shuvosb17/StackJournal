"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useReadingSettings } from "@/hooks/use-reading-settings";

type UseReaderShortcutsOptions = {
  onToggleSettings: () => void;
  onToggleBookmark: () => void;
};

export function useReaderShortcuts({
  onToggleSettings,
  onToggleBookmark,
}: UseReaderShortcutsOptions) {
  const router = useRouter();
  const { increaseFontSize, decreaseFontSize } = useReadingSettings();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "?" || (e.key === "s" && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        onToggleSettings();
      }
      if (e.key === "b" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onToggleBookmark();
      }
      if (e.key === "Escape") {
        router.push("/");
      }
      if (e.key === "]") {
        e.preventDefault();
        increaseFontSize();
      }
      if (e.key === "[") {
        e.preventDefault();
        decreaseFontSize();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    router,
    onToggleSettings,
    onToggleBookmark,
    increaseFontSize,
    decreaseFontSize,
  ]);
}
