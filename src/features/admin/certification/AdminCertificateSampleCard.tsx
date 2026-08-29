"use client";

import Link from "next/link";
import { Award, Download, ExternalLink, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  downloadAdminSampleCertificate,
  openAdminSampleCertificatePreview,
  SAMPLE_CERTIFICATE_ID,
  SAMPLE_LEARNER_ID,
} from "@/src/lib/api/certification";

export function AdminCertificateSampleCard() {
  return (
    <Card className="border-dashed border-primary/30 bg-primary/5 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Certificate sample (admin test)</h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Preview the exact PDF layout with placeholder data only. Nothing is saved to the
            database and no real learner IDs are used.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>Learner ID: {SAMPLE_LEARNER_ID}</li>
            <li>Certificate ID: {SAMPLE_CERTIFICATE_ID}</li>
            <li>Name: Example Learner · Performance: Explorer · 82%</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            onClick={() => void openAdminSampleCertificatePreview()}
          >
            <Eye className="h-4 w-4" /> Open PDF preview
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => void downloadAdminSampleCertificate()}
          >
            <Download className="h-4 w-4" /> Download sample
          </Button>
          <Link href={`/verify/${SAMPLE_CERTIFICATE_ID}`} target="_blank">
            <Button type="button" variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" /> Sample verify page
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
