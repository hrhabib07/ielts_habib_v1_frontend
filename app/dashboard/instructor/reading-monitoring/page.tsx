import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ReadingMonitoringClient } from "./ReadingMonitoringClient";

export default function ReadingMonitoringPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/instructor" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Reading monitoring</h1>
      </div>
      <ReadingMonitoringClient />
    </div>
  );
}
