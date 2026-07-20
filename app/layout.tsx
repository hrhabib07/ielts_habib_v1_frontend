import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { getAppOrigin } from "@/src/lib/api-base-url";
import { GAMLISH_BRAND } from "@/src/lib/gamlish-brand";
import { ThemeProvider } from "@/src/components/shared/ThemeProvider";
import { UiLocaleProvider } from "@/src/contexts/UiLocaleContext";
import { AppShellFallback } from "@/src/components/shared/AppShellFallback";
import { AppShellWithAuth } from "@/src/components/shared/AppShellWithAuth";

/**
 * Runtime font loading (browser only). Avoids next/font/google at build time.
 * Keep weight count low — each family×weight is a blocking download on first paint.
 * Latin digits are used in Bangla UI, so Hind Siliguri alone is enough (no Noto).
 */
const RUNTIME_FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Outfit:wght@400;600;700;800&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(getAppOrigin()),
  title: GAMLISH_BRAND.metaTitle,
  description: GAMLISH_BRAND.metaDescription,
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
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="style"
          href={RUNTIME_FONT_STYLESHEET}
        />
        <link href={RUNTIME_FONT_STYLESHEET} rel="stylesheet" />
      </head>
      <body className="antialiased font-bengali">
        <ThemeProvider>
          <UiLocaleProvider>
            <Suspense fallback={<AppShellFallback />}>
              <AppShellWithAuth>{children}</AppShellWithAuth>
            </Suspense>
          </UiLocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
