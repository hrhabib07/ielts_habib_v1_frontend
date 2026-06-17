/** Loading skeleton for profile summary. matches dashboard layout. */
export function ProfileSummarySkeleton() {
  return (
    <div className="w-full space-y-8">
      <div className="h-64 animate-pulse rounded-3xl bg-muted/40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
        ))}
      </div>
      <div className="h-28 animate-pulse rounded-2xl bg-muted/40" />
      <div className="h-56 animate-pulse rounded-2xl bg-muted/35" />
    </div>
  );
}
