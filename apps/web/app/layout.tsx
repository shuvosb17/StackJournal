import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif, Manrope, Source_Serif_4 } from "next/font/google";

import { AppSearchShell } from "@/components/search/app-search-shell";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "StackJournal",
    template: "%s · StackJournal",
  },
  description:
    "A premium reading platform for software engineers. Curated articles, learning paths, and case studies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} ${instrumentSerif.variable} ${sourceSerif.variable} dark h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col font-sans">
        <AppSearchShell>{children}</AppSearchShell>
      </body>
    </html>
  );
}
