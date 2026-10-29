import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KSEB AE Gradation",
  description: "Projected posts in the KSEB Assistant Engineer gradation list, by date or by person.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
