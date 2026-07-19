"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startDemo } from "@/src/lib/api/demo";
import { DEMO_COPY } from "@/src/lib/demo-copy";
import {
  detectDemoClientMeta,
  writeDemoSessionId,
} from "@/src/lib/demo-session";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

export function DemoNameGate() {
  const router = useRouter();
  const { locale } = useUiLocale();
  const copy = DEMO_COPY[locale];
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const begin = async (displayName: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const meta = detectDemoClientMeta();
      const session = await startDemo({
        displayName,
        deviceType: meta.deviceType,
        browser: meta.browser,
      });
      writeDemoSessionId(session.sessionId);
      router.push("/demo/play");
    } catch {
      setError(copy.errorGeneric);
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12",
        locale === "bn" && "font-bengali",
      )}
      lang={locale}
    >
      <div className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 shadow-xl sm:p-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Gamlish
        </p>
        <h1 className="mt-3 text-center text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          {copy.nameTitle}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {copy.nameSub}
        </p>

        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void begin(name.trim() || null);
          }}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.namePlaceholder}
            maxLength={48}
            className="h-12 rounded-xl text-base"
            autoFocus
            disabled={loading}
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-xl text-base font-bold"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              copy.startPlaying
            )}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          className="mt-2 w-full"
          disabled={loading}
          onClick={() => void begin(null)}
        >
          {copy.continueAsGuest}
        </Button>

        {error ? (
          <p className="mt-3 text-center text-sm text-destructive">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
