import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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

export const metadata: Metadata = {
  title: "GAMLISH — The Game of English",
  description: "Master English through focused practice. GAMLISH offers structured Reading and Writing modules with clarity, strategy, and confidence.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SyncAuthCookie initialUser={initialUser} />
          <div className="flex min-h-screen flex-col">
            <Header initialUser={initialUser} />
            <main className="flex-1">{children}</main>
            <Footer initialUser={initialUser} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
