"use client";

import { ReadingLevelDetailProvider } from "@/src/contexts/ReadingLevelDetailContext";
import { ReadingSidebar } from "@/src/components/reading/ReadingSidebar";

export default function ReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReadingLevelDetailProvider>
      <div className="flex gap-6">
        <ReadingSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </ReadingLevelDetailProvider>
  );
}
