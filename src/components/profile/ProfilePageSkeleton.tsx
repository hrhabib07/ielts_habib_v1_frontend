import { Card } from "@/components/ui/card";

/** Full-viewport profile shell so loading does not look like a small centered block. */
export function ProfilePageSkeleton() {
  return (
    <div className="w-full min-h-[calc(100vh-5rem)]">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="h-8 w-56 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-80 max-w-full rounded-md bg-muted/80 animate-pulse" />
          </div>
          <div className="h-10 w-36 shrink-0 rounded-lg bg-muted animate-pulse" />
        </div>

        <Card className="overflow-hidden border-border/80 p-0">
          <div className="border-b border-border/60 bg-muted/30 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-16 w-16 shrink-0 rounded-full bg-muted animate-pulse" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-6 w-48 max-w-full rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-64 max-w-full rounded-md bg-muted/80 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                <div className="h-5 w-28 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 h-5 w-40 rounded bg-muted animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-muted/80 animate-pulse" />
            <div className="h-4 w-11/12 rounded bg-muted/80 animate-pulse" />
            <div className="h-10 w-40 rounded-lg bg-muted animate-pulse" />
          </div>
        </Card>

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
              {[1, 2, 3, 4, 5].map((j) => (
                <div
                  key={j}
                  className="h-4 rounded bg-muted animate-pulse"
                  style={{ width: `${58 + j * 6}%` }}
                />
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-4 h-5 w-44 rounded bg-muted animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
