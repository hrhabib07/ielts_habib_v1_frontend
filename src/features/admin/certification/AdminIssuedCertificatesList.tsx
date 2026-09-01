"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, ExternalLink, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  downloadAdminIssuedCertificate,
  listAdminIssuedCertificates,
  openAdminIssuedCertificatePdf,
  type AdminIssuedCertificate,
} from "@/src/lib/api/certification";
import { formatVerifyDate } from "@/src/lib/certificate-display";

function StoryBlock({ title, body }: { title: string; body: string }) {
  const text = body?.trim() ?? "";
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="font-medium">{title}</p>
      <p className="mt-1 whitespace-pre-wrap leading-relaxed text-muted-foreground">
        {text || "Left blank"}
      </p>
    </div>
  );
}

export function AdminIssuedCertificatesList() {
  const [rows, setRows] = useState<AdminIssuedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listAdminIssuedCertificates());
    } catch {
      setError("Could not load issued certificates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openPdf = async (row: AdminIssuedCertificate, mode: "view" | "download") => {
    setBusyId(row.certificateId);
    setError(null);
    try {
      if (mode === "download") {
        await downloadAdminIssuedCertificate(row.certificateId);
      } else {
        await openAdminIssuedCertificatePdf(row.certificateId);
      }
    } catch {
      setError(
        mode === "download"
          ? "Could not download this certificate."
          : "Could not open this certificate.",
      );
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {rows.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No certificates issued yet. Approved applications appear here with the same PDF the
          learner received.
        </Card>
      ) : (
        rows.map((row) => (
          <Card key={row.certificateId} className="space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{row.officialName}</p>
                <p className="text-sm text-muted-foreground">
                  {row.studentUsername ? `@${row.studentUsername}` : row.studentEmail}
                  {row.district ? ` · ${row.district}` : ""}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Certificate {row.certificateId}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  Learner {row.gamlishLearnerId}
                </p>
                <p className="text-xs text-muted-foreground">
                  Issued {formatVerifyDate(row.issuedAt)} · {row.programName}
                  {row.performancePercent != null ? ` · ${row.performancePercent}%` : ""}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                Issued
              </span>
            </div>

            <div className="grid gap-3 text-sm md:grid-cols-2">
              <StoryBlock title="Before Gamlish" body={row.storyBefore} />
              <StoryBlock title="Journey" body={row.storyJourney} />
              <StoryBlock title="What changed" body={row.storyTransformation} />
              <StoryBlock title="Message for future learners" body={row.storyMessage} />
              <StoryBlock title="Feedback for Gamlish" body={row.storyGamlishFeedback} />
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="font-medium">Public story consent</p>
                <p className="mt-1 text-muted-foreground">
                  {row.publicStoryConsent
                    ? "Yes · may show on homepage and profile"
                    : "No · admin only"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="gap-2"
                disabled={busyId === row.certificateId}
                onClick={() => void openPdf(row, "view")}
              >
                {busyId === row.certificateId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Open issued PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={busyId === row.certificateId}
                onClick={() => void openPdf(row, "download")}
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
              <Link href={`/verify/${encodeURIComponent(row.certificateId)}`} target="_blank">
                <Button type="button" variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" /> Public verify page
                </Button>
              </Link>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
