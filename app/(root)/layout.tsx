import type { ReactNode } from "react";
import { Header } from "@/components/navbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
