import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { VersionListClient } from "./VersionListClient";

interface PageProps {
  params: Promise<{ levelId: string }>;
}

export default async function VersionsPage({ params }: PageProps) {
  const { levelId } = await params;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="/dashboard/instructor/reading-levels"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Reading levels
          </Link>
        </Button>
      </div>
      <VersionListClient levelId={levelId} />
    </div>
  );
}
