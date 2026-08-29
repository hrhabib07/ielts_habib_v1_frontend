"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CertificateVerifyView } from "@/src/components/certification/CertificateVerifyView";
import {
  verifyCertificatePublic,
  type VerifyCertificateResult,
} from "@/src/lib/api/certification";

export default function VerifyCertificatePage() {
  const params = useParams();
  const certificateId = String(params.certificateId ?? "");
  const [result, setResult] = useState<VerifyCertificateResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certificateId) return;
    void (async () => {
      setLoading(true);
      try {
        const data = await verifyCertificatePublic(certificateId);
        setResult(data);
      } catch {
        setResult({ valid: false, reason: "not_found" });
      } finally {
        setLoading(false);
      }
    })();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return <CertificateVerifyView certificateId={certificateId} result={result} />;
}
