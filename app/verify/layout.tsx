import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Certificate · Gamlish",
  description:
    "Verify an official Gamlish certificate. Scan the QR code on your PDF or enter the certificate ID.",
  robots: { index: true, follow: true },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
