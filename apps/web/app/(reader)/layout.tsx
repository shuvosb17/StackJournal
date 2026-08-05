import { ReadingSettingsProvider } from "@/hooks/use-reading-settings";

import "@/styles/reader.css";

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReadingSettingsProvider>
      <main className="flex-1">{children}</main>
    </ReadingSettingsProvider>
  );
}
