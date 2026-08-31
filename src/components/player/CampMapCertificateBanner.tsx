"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCertificationStatus, type CertificationStatus } from "@/src/lib/api/certification";

export function CampMapCertificateBanner() {
  const [status, setStatus] = useState<CertificationStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getCertificationStatus()
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status?.mission21Complete) return null;
  if (status.certificate) {
    return (
      <Link
        href="/certification"
        className="flex items-center gap-3 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-background to-amber-500/10 px-4 py-3.5"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
          <Award className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-bold">Your certificate is ready</span>
          <span className="block text-xs text-muted-foreground">Open, download, or share your verify link</span>
        </span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>
    );
  }

  if (status.application?.status === "submitted") {
    return (
      <div className="rounded-2xl border border-primary/25 bg-primary/8 px-4 py-3.5 text-sm">
        <p className="font-bold">Certificate under review</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Gamlish is reviewing your application. You will be notified after approval.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-500/15 to-background px-4 py-4">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Award className="h-4 w-4 text-amber-600" />
        Fundamental English complete
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Claim your official Gamlish certificate. It takes a few minutes.
      </p>
      <Button asChild className="mt-3 w-full" size="sm">
        <Link href="/certification">
          {status ? "Claim your certificate" : <Loader2 className="h-4 w-4 animate-spin" />}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
