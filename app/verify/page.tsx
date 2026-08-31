"use client";

import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { VerifyLookupForm } from "@/src/components/certification/VerifyLookupForm";

export default function VerifyLandingPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Gamlish Verify
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">
          Verify a certificate
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the Certificate ID or Learner ID printed on the PDF. You can also paste the full
          verify link.
        </p>
      </div>

      <Card className="border-2 p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-primary">
          <ShieldCheck className="h-5 w-5" />
          Official Gamlish registry
        </div>
        <VerifyLookupForm />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          QR codes on issued certificates open the result page directly.
        </p>
      </Card>
    </div>
  );
}
