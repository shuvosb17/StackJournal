"use client";

import { SearchDialog } from "@/components/search/search-dialog";
import { SearchProvider } from "@/components/search/search-provider";

export function AppSearchShell({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      {children}
      <SearchDialog />
    </SearchProvider>
  );
}
