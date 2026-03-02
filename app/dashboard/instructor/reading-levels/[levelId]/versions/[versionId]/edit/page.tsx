import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { VersionEditClient } from "./VersionEditClient";

interface PageProps {
  params: Promise<{ levelId: string; versionId: string }>;
}

export default async function VersionEditPage({ params }: PageProps) {
  const { levelId, versionId } = await params;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`/dashboard/instructor/reading-levels/${levelId}/versions`}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Versions
          </Link>
        </Button>
      </div>
      <VersionEditClient levelId={levelId} versionId={versionId} />
    </div>
  );
}
