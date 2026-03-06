"use client";

import { usePathname } from "next/navigation";

/**
 * Profile: minimal internal layout (no full dashboard).
 * Root layout provides Header + Footer.
 * Mock test (final-evaluation) gets full bleed, no container.
 */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isExamPage = pathname.includes("/final-evaluation") || pathname.includes("/practice-test");

  if (isExamPage) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8">
      {children}
    </div>
  );
}
