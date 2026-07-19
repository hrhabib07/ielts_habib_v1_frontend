import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GamlishNavBrand } from "@/src/components/shared/GamlishNavBrand";

/** Minimal top bar for auth flows that are not the full login/register shells. */
export function AuthSimpleChrome({ homeLabel = "Home" }: { homeLabel?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center transition-opacity hover:opacity-90"
          aria-label="Gamlish home"
        >
          <GamlishNavBrand showTagline={false} />
        </Link>
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent/30 hover:bg-accent/5 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {homeLabel}
        </Link>
      </div>
    </header>
  );
}
