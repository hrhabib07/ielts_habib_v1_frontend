import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { getAppOrigin } from "@/src/lib/api-base-url";
import { ThemeProvider } from "@/src/components/shared/ThemeProvider";
import { AppShellFallback } from "@/src/components/shared/AppShellFallback";
import { AppShellWithAuth } from "@/src/components/shared/AppShellWithAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppOrigin()),
  title: "GAMLISH — The Game of English",
  description: "Master English through focused practice. GAMLISH offers structured Reading and Writing modules with clarity, strategy, and confidence.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${hindSiliguri.variable} antialiased`}
      >
        <ThemeProvider>
          <Suspense fallback={<AppShellFallback />}>
            <AppShellWithAuth>{children}</AppShellWithAuth>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
