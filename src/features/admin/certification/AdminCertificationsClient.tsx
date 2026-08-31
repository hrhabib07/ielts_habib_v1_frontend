"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Download, Eye, Loader2, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  downloadAdminApplicationCertificatePreview,
  listAdminCertificationApplications,
  openAdminApplicationCertificatePreview,
  reviewAdminCertificationApplication,
  type AdminCertificationApplication,
} from "@/src/lib/api/certification";
import { AdminCertificateSampleCard } from "@/src/features/admin/certification/AdminCertificateSampleCard";
import { AdminLearnerFormPreviewCard } from "@/src/features/admin/certification/AdminLearnerFormPreviewCard";
import { formatDobDisplay } from "@/src/lib/date-of-birth";

function AdminStoryBlock({ title, body }: { title: string; body: string }) {
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

export function AdminCertificationsClient() {
  const [rows, setRows] = useState<AdminCertificationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [changeNotes, setChangeNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listAdminCertificationApplications());
    } catch {
      setError("Could not load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const review = async (
    row: AdminCertificationApplication,
    action: "approve" | "reject" | "request_changes",
  ) => {
    setBusyId(row.id);
    setError(null);
    try {
      await reviewAdminCertificationApplication(row.id, {
        action,
        changeRequestNote: changeNotes[row.id],
      });
      await load();
    } catch {
      setError("Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/admin" className="rounded-lg p-2 hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Certification applications</h1>
          <p className="text-sm text-muted-foreground">
            Review learner identity and story before issuing certificates.
          </p>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <AdminCertificateSampleCard />
      <AdminLearnerFormPreviewCard />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No pending applications. Use the sample card above to test the certificate layout.
        </Card>
      ) : (
        <div className="space-y-5">
          {rows.map((row) => (
            <Card key={row.id} className="space-y-4 p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold">{row.officialName}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.studentUsername ? `@${row.studentUsername}` : row.studentName} ·{" "}
                    {row.studentEmail} · {row.studentPhoneMasked}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Date of birth {formatDobDisplay(row.dateOfBirth)} · WhatsApp {row.whatsapp}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Present: {row.presentAddress.district}, {row.presentAddress.city}
                    {row.presentAddress.addressLine ? ` · ${row.presentAddress.addressLine}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  {row.status}
                </span>
              </div>

              <div className="grid gap-3 text-sm md:grid-cols-2">
                <AdminStoryBlock title="Before Gamlish" body={row.storyBefore} />
                <AdminStoryBlock title="Journey" body={row.storyJourney} />
                <AdminStoryBlock title="What changed" body={row.storyTransformation} />
                <AdminStoryBlock title="Message for future learners" body={row.storyMessage} />
                <AdminStoryBlock title="Feedback for Gamlish" body={row.storyGamlishFeedback} />
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="font-medium">Public story consent</p>
                  <p className="mt-1 text-muted-foreground">
                    {row.publicStoryConsent ? "Yes · may show on profile" : "No"}
                  </p>
                </div>
              </div>

              <Textarea
                placeholder="Note for learner if requesting changes..."
                value={changeNotes[row.id] ?? ""}
                onChange={(e) =>
                  setChangeNotes((prev) => ({ ...prev, [row.id]: e.target.value }))
                }
                rows={2}
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2"
                  disabled={previewingId === row.id || busyId === row.id}
                  onClick={async () => {
                    setPreviewingId(row.id);
                    setError(null);
                    try {
                      await openAdminApplicationCertificatePreview(row.id);
                    } catch {
                      setError("Could not open certificate preview.");
                    } finally {
                      setPreviewingId(null);
                    }
                  }}
                >
                  {previewingId === row.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  Preview certificate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={previewingId === row.id || busyId === row.id}
                  onClick={async () => {
                    setPreviewingId(row.id);
                    try {
                      await downloadAdminApplicationCertificatePreview(row.id);
                    } catch {
                      setError("Could not download certificate preview.");
                    } finally {
                      setPreviewingId(null);
                    }
                  }}
                >
                  <Download className="h-4 w-4" /> Download preview
                </Button>
                <Button
                  className="gap-2"
                  disabled={busyId === row.id || previewingId === row.id}
                  onClick={() => void review(row, "approve")}
                >
                  <Check className="h-4 w-4" /> Approve & issue certificate
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={busyId === row.id}
                  onClick={() => void review(row, "request_changes")}
                >
                  <MessageSquare className="h-4 w-4" /> Request changes
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  disabled={busyId === row.id}
                  onClick={() => void review(row, "reject")}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
