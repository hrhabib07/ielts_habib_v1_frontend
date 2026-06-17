import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { getAppOrigin } from "@/src/lib/api-base-url";
import { ThemeProvider } from "@/src/components/shared/ThemeProvider";
import { AppShellFallback } from "@/src/components/shared/AppShellFallback";
import { AppShellWithAuth } from "@/src/components/shared/AppShellWithAuth";

/**
 * Runtime font loading (browser only). avoids next/font/google network fetch at build time,
 * which fails in offline CI and restricted networks.
 */
const RUNTIME_FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(getAppOrigin()),
  title: "GAMLISH. The Game of English",
  description:
    "Master English through focused practice. GAMLISH offers structured Reading and Writing modules with clarity, strategy, and confidence.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={RUNTIME_FONT_STYLESHEET} rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <Suspense fallback={<AppShellFallback />}>
            <AppShellWithAuth>{children}</AppShellWithAuth>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
