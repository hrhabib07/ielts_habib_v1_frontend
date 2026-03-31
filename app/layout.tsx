import type { Metadata } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { getAppOrigin } from "@/src/lib/api-base-url";
import { ThemeProvider } from "@/src/components/shared/ThemeProvider";
import { Header } from "@/src/components/shared/Header";
import { Footer } from "@/src/components/shared/Footer";
import { SyncAuthCookie } from "@/src/components/auth/SyncAuthCookie";
import { getCurrentUser } from "@/src/lib/auth-server";

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

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getCurrentUser();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${hindSiliguri.variable} antialiased`}
      >
        <ThemeProvider>
          <SyncAuthCookie initialUser={initialUser} />
          <div className="flex min-h-screen flex-col">
            <Header initialUser={initialUser} />
            <main className="flex min-h-0 flex-1 flex-col">{children}</main>
            <Footer initialUser={initialUser} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
