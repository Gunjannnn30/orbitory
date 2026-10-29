import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "./shell";

export const metadata: Metadata = {
  title: {
    default: "Orbitory — The Universe of Business",
    template: "%s · Orbitory",
  },
  description:
    "Orbitory is a product management intelligence platform that organizes companies into an explorable universe. Decode decisions, study metrics, and learn from real business stories.",
  applicationName: "Orbitory",
  keywords: [
    "product management",
    "company intelligence",
    "business research",
    "startups",
    "metrics",
  ],
  authors: [{ name: "Orbitory" }],
  openGraph: {
    title: "Orbitory — The Universe of Business",
    description:
      "Explore businesses. Decode decisions. Think like a PM. A product management intelligence platform.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0b0d14" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="grain min-h-dvh overflow-x-hidden">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
