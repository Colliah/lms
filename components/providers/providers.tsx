"use client";

import type { ReactNode } from "react";
import { Toaster } from "../ui/sonner";
import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <Toaster richColors position="top-right" />
      {children}
    </QueryProvider>
  );
}
