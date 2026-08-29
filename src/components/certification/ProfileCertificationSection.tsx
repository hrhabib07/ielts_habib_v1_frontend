"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Award, Copy, Download, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  downloadCertificatePdf,
  getCertificationStatus,
  type CertificationStatus,
} from "@/src/lib/api/certification";
import { buildLinkedInCertificateText } from "@/src/lib/certificate-display";

export function ProfileCertificationSection() {
  const [status, setStatus] = useState<CertificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState<"link" | "linkedin" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await getCertificationStatus());
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await downloadCertificatePdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Gamlish-Certificate.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const copyText = async (text: string, kind: "link" | "linkedin") => {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return null;
  if (!status?.eligible && !status?.certificate) return null;

  if (status.certificate) {
    const c = status.certificate;
    const verifyUrl =
      c.verifyUrl ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/verify/${encodeURIComponent(c.certificateId)}`
        : `/verify/${c.certificateId}`);

    return (
      <Card className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">Your certificate</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {c.programName} · {c.gamlishLearnerId}
        </p>
        <p className="text-xs text-muted-foreground">Certificate ID: {c.certificateId}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-2" disabled={downloading} onClick={() => void handleDownload()}>
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </Button>
          <Link href={`/verify/${c.certificateId}`} target="_blank">
            <Button size="sm" variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" /> Verify
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => void copyText(verifyUrl, "link")}
          >
            <Copy className="h-4 w-4" />
            {copied === "link" ? "Copied" : "Copy verify link"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() =>
              void copyText(
                buildLinkedInCertificateText({
                  officialName: c.officialName,
                  programName: c.programName,
                  verifyUrl,
                  gamlishLearnerId: c.gamlishLearnerId,
                }),
                "linkedin",
              )
            }
          >
            <Copy className="h-4 w-4" />
            {copied === "linkedin" ? "Copied" : "LinkedIn text"}
          </Button>
        </div>
      </Card>
    );
  }

  if (status.mission21Complete) {
    return (
      <Card className="space-y-3 border-primary/20 bg-primary/5 p-6">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Claim your certificate</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          You completed Fundamental English. Submit your verified profile for Gamlish certification.
        </p>
        <Link href="/certification">
          <Button size="sm">Start certification application</Button>
        </Link>
      </Card>
    );
  }

  return null;
}
