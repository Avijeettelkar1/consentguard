import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConsentGuard",
  description: "AI privacy auditor for Daytona HackSprint Berlin 2026."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
