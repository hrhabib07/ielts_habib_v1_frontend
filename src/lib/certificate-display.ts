export const CERTIFICATE_SIGNER_NAME = "MD HABIBUR RAHMAN";
export const CERTIFICATE_SIGNER_TITLE = "Founder & Program Director";
export const CERTIFICATE_SIGNER_ORG = "Gamlish";

export interface CertificatePerformanceView {
  completionResult: string;
  achievementLevel: string | null;
  achievementLevelDescription: string;
  finalScorePercent: number | null;
  finalScoreLabel: string;
  finalScoreDescription: string;
}

export function formatVerifyDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function buildLinkedInCertificateText(input: {
  officialName: string;
  programName: string;
  verifyUrl: string;
  gamlishLearnerId: string;
}): string {
  return [
    `I completed ${input.programName} on Gamlish.`,
    "",
    `Verified Gamlish Learner ID: ${input.gamlishLearnerId}`,
    `Verify my certificate: ${input.verifyUrl}`,
    "",
    "#Gamlish #EnglishLearning #FundamentalEnglish",
  ].join("\n");
}
