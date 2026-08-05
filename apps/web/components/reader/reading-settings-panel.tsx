"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useReadingSettings } from "@/hooks/use-reading-settings";
import type {
  FontSize,
  LineHeight,
  ReadingTheme,
  ReadingWidth,
} from "@/lib/reader/types";

type ReadingSettingsPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[13px] font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-[13px] transition-colors",
              value === opt.value
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReadingSettingsPanel({
  open,
  onOpenChange,
}: ReadingSettingsPanelProps) {
  const {
    settings,
    setFontSize,
    setLineHeight,
    setWidth,
    setTheme,
  } = useReadingSettings();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Reading settings</SheetTitle>
          <SheetDescription>
            Customize typography and theme. Saved automatically.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <OptionGroup<FontSize>
            label="Font size"
            value={settings.fontSize}
            onChange={setFontSize}
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
              { value: "xl", label: "Extra large" },
            ]}
          />

          <OptionGroup<LineHeight>
            label="Line height"
            value={settings.lineHeight}
            onChange={setLineHeight}
            options={[
              { value: "compact", label: "Compact" },
              { value: "normal", label: "Normal" },
              { value: "relaxed", label: "Relaxed" },
            ]}
          />

          <OptionGroup<ReadingWidth>
            label="Reading width"
            value={settings.width}
            onChange={setWidth}
            options={[
              { value: "narrow", label: "680px" },
              { value: "default", label: "720px" },
              { value: "wide", label: "800px" },
            ]}
          />

          <OptionGroup<ReadingTheme>
            label="Theme"
            value={settings.theme}
            onChange={setTheme}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "oled", label: "OLED" },
              { value: "sepia", label: "Sepia" },
            ]}
          />

          <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
            <p className="text-[12px] font-medium text-foreground">
              Keyboard shortcuts
            </p>
            <dl className="mt-3 space-y-2 text-[12px] text-muted-foreground">
              <div className="flex justify-between gap-4">
                <dt>Settings</dt>
                <dd>
                  <kbd className="rounded border px-1.5 py-0.5 font-mono">S</kbd>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Bookmark</dt>
                <dd>
                  <kbd className="rounded border px-1.5 py-0.5 font-mono">B</kbd>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Font size</dt>
                <dd>
                  <kbd className="rounded border px-1.5 py-0.5 font-mono">[</kbd>
                  {" "}
                  <kbd className="rounded border px-1.5 py-0.5 font-mono">]</kbd>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Back home</dt>
                <dd>
                  <kbd className="rounded border px-1.5 py-0.5 font-mono">Esc</kbd>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
