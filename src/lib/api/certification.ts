import { throwApiError } from "@/src/lib/api-error";

export type CertificationApplicationStatus =
  | "draft"
  | "submitted"
  | "changes_requested"
  | "approved"
  | "rejected";

export interface CertificationAddress {
  district: string;
  city: string;
  addressLine?: string;
}

export interface CertificationApplication {
  id: string;
  status: CertificationApplicationStatus;
  officialName: string;
  dateOfBirth: string;
  whatsapp: string;
  presentAddress: CertificationAddress;
  permanentAddress: CertificationAddress;
  sameAsPresentAddress: boolean;
  storyBefore: string;
  storyJourney: string;
  storyTransformation: string;
  storyMessage: string;
  storyGamlishFeedback: string;
  publicStoryConsent: boolean;
  submittedAt: string | null;
  reviewedAt: string | null;
  adminNote: string | null;
  changeRequestNote: string | null;
}

export interface CertificateView {
  id: string;
  certificateId: string;
  programCode: string;
  programName: string;
  officialName: string;
  gamlishLearnerId: string;
  completionDate: string;
  issuedAt: string;
  performanceBadge: "master" | "explorer" | "apprentice" | null;
  performancePercent: number | null;
  status: "valid" | "revoked";
  verifyUrl: string;
}

export interface CertificationStatus {
  eligible: boolean;
  mission21Complete: boolean;
  contact: {
    hasVerifiedPhone: boolean;
    hasVerifiedEmail: boolean;
    phoneMasked: string | null;
    phoneLocal?: string | null;
    email: string | null;
  };
  suggestedOfficialName?: string;
  application: CertificationApplication | null;
  certificate: CertificateView | null;
  learnerProfile: {
    gamlishLearnerId: string;
    officialName: string;
    district: string;
    identityLockedAt: string;
  } | null;
  performance: {
    badge: "master" | "explorer" | "apprentice" | null;
    percent: number | null;
    completedAt: string | null;
  } | null;
  canApply: boolean;
  canEditApplication: boolean;
}

export interface AdminCertificationApplication extends CertificationApplication {
  userId: string;
  studentName: string;
  studentUsername: string | null;
  studentEmail: string;
  studentPhoneMasked: string | null;
  performance: CertificationStatus["performance"];
}

export interface CertificatePerformanceView {
  completionResult: string;
  achievementLevel: string | null;
  achievementLevelDescription: string;
  finalScorePercent: number | null;
  finalScoreLabel: string;
  finalScoreDescription: string;
}

export interface VerifyCertificatePayload {
  certificateId: string;
  status: string;
  officialName: string;
  programName: string;
  gamlishLearnerId: string;
  completionDate: string;
  issuedAt: string;
  performance?: CertificatePerformanceView;
  identity: string;
  verifyUrl?: string;
  templateVersion?: number;
}

export interface VerifyCertificateResult {
  valid: boolean;
  reason?: "not_found" | "revoked" | "sample" | "preview";
  preview?: boolean;
  message?: string;
  certificateId?: string;
  certificate?: VerifyCertificatePayload;
}

function unwrap<T>(res: { data?: { data?: T } }): T {
  const d = res.data?.data;
  if (d === undefined) throw new Error("No data");
  return d;
}

export async function getCertificationStatus(): Promise<CertificationStatus> {
  try {
    const { default: apiClient } = await import("@/src/lib/api-client");
    const res = await apiClient.get<{ data: CertificationStatus }>("/certification/status");
    return unwrap(res);
  } catch (err) {
    throwApiError(err, "Could not load certification status.");
  }
}

export async function submitCertificationApplication(payload: {
  officialName: string;
  dateOfBirth: string;
  whatsapp: string;
  presentAddress: CertificationAddress;
  permanentAddress: CertificationAddress;
  sameAsPresentAddress: boolean;
  storyBefore: string;
  storyJourney: string;
  storyTransformation: string;
  storyMessage: string;
  storyGamlishFeedback: string;
  publicStoryConsent: boolean;
}): Promise<CertificationApplication> {
  try {
    const { default: apiClient } = await import("@/src/lib/api-client");
    const res = await apiClient.post<{ data: CertificationApplication }>(
      "/certification/application",
      payload,
    );
    return unwrap(res);
  } catch (err) {
    throwApiError(err, "Could not submit your application.");
  }
}

export async function requestCertificationLinkEmail(
  email: string,
): Promise<{ willRemoveUnusedAccount?: boolean }> {
  try {
    const { default: apiClient } = await import("@/src/lib/api-client");
    const res = await apiClient.post<{ data: { willRemoveUnusedAccount?: boolean } }>(
      "/certification/contact/link-email/request",
      { email },
    );
    return unwrap(res);
  } catch (err) {
    throwApiError(err, "Could not send the email code.");
  }
}

export async function verifyCertificationLinkEmail(
  email: string,
  otp: string,
): Promise<{ unusedAccountRemoved?: boolean }> {
  try {
    const { default: apiClient } = await import("@/src/lib/api-client");
    const res = await apiClient.post<{ data: { unusedAccountRemoved?: boolean } }>(
      "/certification/contact/link-email/verify",
      { email, otp },
    );
    return unwrap(res);
  } catch (err) {
    throwApiError(err, "Invalid or expired email code.");
  }
}

export async function requestCertificationLinkPhone(
  phone: string,
): Promise<{ willRemoveUnusedAccount?: boolean }> {
  try {
    const { default: apiClient } = await import("@/src/lib/api-client");
    const res = await apiClient.post<{ data: { willRemoveUnusedAccount?: boolean } }>(
      "/certification/contact/link-phone/request",
      { phone },
    );
    return unwrap(res);
  } catch (err) {
    throwApiError(err, "Could not send the phone OTP.");
  }
}

export async function verifyCertificationLinkPhone(
  phone: string,
  otp: string,
): Promise<{ unusedAccountRemoved?: boolean }> {
  try {
    const { default: apiClient } = await import("@/src/lib/api-client");
    const res = await apiClient.post<{ data: { unusedAccountRemoved?: boolean } }>(
      "/certification/contact/link-phone/verify",
      { phone, otp },
    );
    return unwrap(res);
  } catch (err) {
    throwApiError(err, "Invalid or expired phone OTP.");
  }
}

export async function downloadCertificatePdf(): Promise<Blob> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get("/certification/certificate/pdf", {
    responseType: "blob",
  });
  return res.data as Blob;
}

export async function verifyCertificatePublic(
  certificateId: string,
): Promise<VerifyCertificateResult> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: VerifyCertificateResult }>(
    `/certification/verify/${encodeURIComponent(certificateId)}`,
  );
  return unwrap(res);
}

export async function getAdminCertificationPendingCount(): Promise<number> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: { count: number } }>(
    "/admin/certification/pending-count",
  );
  return unwrap(res).count;
}

export async function listAdminCertificationApplications(
  status?: string,
): Promise<AdminCertificationApplication[]> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const query = status ? `?status=${status}` : "";
  const res = await apiClient.get<{ data: AdminCertificationApplication[] }>(
    `/admin/certification/applications${query}`,
  );
  return unwrap(res);
}

export async function reviewAdminCertificationApplication(
  applicationId: string,
  payload: {
    action: "approve" | "reject" | "request_changes";
    adminNote?: string;
    changeRequestNote?: string;
  },
): Promise<unknown> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.patch(`/admin/certification/applications/${applicationId}`, payload);
  return unwrap(res);
}

async function fetchAdminCertificationPdf(
  path: string,
  mode: "inline" | "download",
): Promise<void> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get(path, { responseType: "blob" });
  const blob = res.data as Blob;
  const url = URL.createObjectURL(blob);
  if (mode === "download") {
    const a = document.createElement("a");
    a.href = url;
    a.download =
      path.includes("sample") ? "Gamlish-Certificate-SAMPLE.pdf" : "Gamlish-Certificate-PREVIEW.pdf";
    a.click();
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

/** Admin-only sample certificate (GML-2026-XXXXXX placeholders). */
export async function openAdminSampleCertificatePreview(): Promise<void> {
  await fetchAdminCertificationPdf("/admin/certification/preview/sample/pdf", "inline");
}

export async function downloadAdminSampleCertificate(): Promise<void> {
  await fetchAdminCertificationPdf("/admin/certification/preview/sample/download", "download");
}

/** Preview certificate for a pending application before approval. */
export async function openAdminApplicationCertificatePreview(
  applicationId: string,
): Promise<void> {
  await fetchAdminCertificationPdf(
    `/admin/certification/applications/${applicationId}/preview/pdf`,
    "inline",
  );
}

export async function downloadAdminApplicationCertificatePreview(
  applicationId: string,
): Promise<void> {
  await fetchAdminCertificationPdf(
    `/admin/certification/applications/${applicationId}/preview/download`,
    "download",
  );
}

export const SAMPLE_CERTIFICATE_ID = "GML-CERT-FE-2026-XXXXXX";
export const SAMPLE_LEARNER_ID = "GML-2026-XXXXXX";
