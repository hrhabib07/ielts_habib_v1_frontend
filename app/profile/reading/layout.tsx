"use client";

import { usePathname } from "next/navigation";
import { ReadingLevelDetailProvider } from "@/src/contexts/ReadingLevelDetailContext";
import { ReadingSidebar } from "@/src/components/reading/ReadingSidebar";

export default function ReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isMockTestPage = pathname.includes("/final-evaluation");

  return (
    <ReadingLevelDetailProvider>
      {isMockTestPage ? (
        <div className="min-h-screen w-full">{children}</div>
      ) : (
        <div className="flex gap-6">
          <ReadingSidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      )}
    </ReadingLevelDetailProvider>
  );
}
