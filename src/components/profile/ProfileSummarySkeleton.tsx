import { Card } from "@/components/ui/card";

/** Loading skeleton for profile summary. */
export function ProfileSummarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="mt-2 h-8 w-16 rounded bg-muted animate-pulse" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <div className="h-5 w-32 rounded bg-muted animate-pulse" />
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: `${60 + i * 5}%` }} />
          ))}
        </div>
      </Card>
    </div>
  );
}
