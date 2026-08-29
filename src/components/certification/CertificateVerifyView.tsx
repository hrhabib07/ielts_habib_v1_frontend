"use client";

import { useState } from "react";
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  Copy,
  ShieldAlert,
  ShieldX,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { VerifyCertificateResult } from "@/src/lib/api/certification";
import {
  buildLinkedInCertificateText,
  formatVerifyDate,
  type CertificatePerformanceView,
} from "@/src/lib/certificate-display";

interface CertificateVerifyViewProps {
  certificateId: string;
  result: VerifyCertificateResult;
}

type VerifyState = "valid" | "sample" | "preview" | "revoked" | "not_found";

function resolveState(result: VerifyCertificateResult): VerifyState {
  if (result.valid) return "valid";
  if (result.reason === "sample") return "sample";
  if (result.reason === "preview") return "preview";
  if (result.reason === "revoked") return "revoked";
  return "not_found";
}

const STATE_CONFIG: Record<
  VerifyState,
  {
    icon: typeof CheckCircle2;
    iconClass: string;
    title: string;
    subtitle: string;
    badge: string;
    badgeClass: string;
  }
> = {
  valid: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    title: "Verified Gamlish Certificate",
    subtitle: "This certificate is authentic and currently valid.",
    badge: "Valid",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  sample: {
    icon: ShieldAlert,
    iconClass: "text-amber-600",
    title: "Sample certificate",
    subtitle: "Admin preview only. Placeholder IDs. Not a real learner.",
    badge: "Sample",
    badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
  },
  preview: {
    icon: ShieldAlert,
    iconClass: "text-amber-600",
    title: "Preview certificate",
    subtitle:
      "Admin preview before approval. This certificate is not issued until Gamlish approves.",
    badge: "Preview",
    badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
  },
  revoked: {
    icon: ShieldX,
    iconClass: "text-destructive",
    title: "Certificate revoked",
    subtitle: "This certificate was issued but is no longer valid.",
    badge: "Revoked",
    badgeClass: "bg-destructive/10 text-destructive",
  },
  not_found: {
    icon: XCircle,
    iconClass: "text-destructive",
    title: "Certificate not found",
    subtitle: "No matching certificate exists in the Gamlish registry.",
    badge: "Not found",
    badgeClass: "bg-muted text-muted-foreground",
  },
};

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-mono text-sm text-foreground">{value}</dd>
    </div>
  );
}

function PerformanceBlock({ performance }: { performance: CertificatePerformanceView }) {
  return (
    <div className="space-y-4 rounded-xl border bg-muted/20 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <BadgeCheck className="h-4 w-4" />
        Achievement details
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Completion result</p>
          <p className="mt-1 text-sm font-medium">{performance.completionResult}</p>
        </div>
        {performance.achievementLevel ? (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Achievement level
            </p>
            <p className="mt-1 text-sm font-medium">{performance.achievementLevel}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {performance.achievementLevelDescription}
            </p>
          </div>
        ) : null}
        {performance.finalScorePercent != null ? (
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {performance.finalScoreLabel}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
              {performance.finalScorePercent}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {performance.finalScoreDescription}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function CertificateVerifyView({ certificateId, result }: CertificateVerifyViewProps) {
  const state = resolveState(result);
  const config = STATE_CONFIG[state];
  const Icon = config.icon;
  const cert = result.certificate;
  const verifyUrl =
    cert?.verifyUrl ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/verify/${encodeURIComponent(certificateId)}`
      : `/verify/${encodeURIComponent(certificateId)}`);

  const [copied, setCopied] = useState<"link" | "linkedin" | null>(null);

  const copyText = async (text: string, kind: "link" | "linkedin") => {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 2000);
  };

  const showDetails = Boolean(
    cert && (state === "valid" || state === "sample" || state === "revoked" || state === "preview"),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Gamlish Verify</p>
        <p className="mt-1 text-sm text-muted-foreground">Official certificate verification</p>
      </div>

      <Card className="overflow-hidden border-2">
        <div className="border-b bg-gradient-to-b from-primary/5 to-transparent px-6 py-8 text-center sm:px-10">
          <Icon className={`mx-auto h-14 w-14 ${config.iconClass}`} />
          <span
            className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClass}`}
          >
            {config.badge}
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{config.title}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {state === "preview" ? result.message ?? config.subtitle : config.subtitle}
          </p>
        </div>

        {showDetails && cert ? (
          <div className="space-y-6 p-6 sm:p-8">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Certificate presented to
              </p>
              <p className="mt-2 text-3xl font-bold uppercase tracking-tight text-primary sm:text-4xl">
                {cert.officialName}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                <Award className="h-4 w-4 text-amber-500" />
                {cert.programName}
              </div>
            </div>

            {cert.performance ? <PerformanceBlock performance={cert.performance} /> : null}

            <dl className="grid gap-4 rounded-xl border p-5 sm:grid-cols-2">
              <MetaRow label="Certificate ID" value={cert.certificateId} />
              <MetaRow label="Gamlish Learner ID" value={cert.gamlishLearnerId} />
              <MetaRow label="Completion date" value={formatVerifyDate(cert.completionDate)} />
              <MetaRow label="Issued on" value={formatVerifyDate(cert.issuedAt)} />
              <div className="sm:col-span-2">
                <MetaRow label="Identity verification" value={cert.identity} />
              </div>
            </dl>

            {state === "valid" ? (
              <div className="flex flex-wrap gap-2">
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
                        officialName: cert.officialName,
                        programName: cert.programName,
                        verifyUrl,
                        gamlishLearnerId: cert.gamlishLearnerId,
                      }),
                      "linkedin",
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                  {copied === "linkedin" ? "Copied" : "Copy LinkedIn text"}
                </Button>
              </div>
            ) : null}

            <p className="text-center text-xs text-muted-foreground">
              Issued by Gamlish · The Game of English
            </p>
          </div>
        ) : state === "not_found" ? (
          <div className="space-y-3 p-6 text-sm text-muted-foreground sm:p-8">
            <p>Check that the certificate ID matches the QR code or PDF exactly.</p>
            <p className="font-mono text-xs text-foreground">{certificateId}</p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
