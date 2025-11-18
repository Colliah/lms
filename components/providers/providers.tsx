"use client";

import type { ReactNode } from "react";
import { Toaster } from "../ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <Toaster richColors position="top-right" />
      {children}
    </>
  );
}
