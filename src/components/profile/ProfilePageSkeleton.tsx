import { Card } from "@/components/ui/card";

/** Full-viewport profile shell so loading does not look like a small centered block. */
export function ProfilePageSkeleton() {
  return (
    <div className="w-full min-h-[calc(100vh-5rem)]">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6">
        <div className="h-40 rounded-3xl bg-muted/60 animate-pulse" />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-36 rounded-2xl bg-muted/50 animate-pulse" />
          <div className="h-36 rounded-2xl bg-muted/50 animate-pulse" />
        </div>

        <div className="h-56 rounded-3xl bg-muted/40 animate-pulse" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/80 p-6">
              <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
              <div className="mt-2 h-8 w-16 rounded-md bg-muted animate-pulse" />
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="h-48 animate-pulse bg-muted/30" />
          <Card className="h-48 animate-pulse bg-muted/30" />
        </div>

        <Card className="p-6">
          <div className="mb-4 h-5 w-44 rounded bg-muted animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                <div className="h-10 w-full rounded-xl bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
