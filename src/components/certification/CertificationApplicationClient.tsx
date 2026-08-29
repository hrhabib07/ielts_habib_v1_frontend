"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BANGLADESH_DISTRICTS } from "@/src/lib/constants/bangladesh-districts";
import {
  getCertificationStatus,
  requestCertificationLinkEmail,
  requestCertificationLinkPhone,
  submitCertificationApplication,
  verifyCertificationLinkEmail,
  verifyCertificationLinkPhone,
  type CertificationStatus,
} from "@/src/lib/api/certification";
import { cn } from "@/lib/utils";

const STEPS = ["Contact", "Identity", "Address", "Your story", "Review"] as const;

function DistrictSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
    >
      <option value="">Select district</option>
      {BANGLADESH_DISTRICTS.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  );
}

export function CertificationApplicationClient() {
  const [status, setStatus] = useState<CertificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [linkEmail, setLinkEmail] = useState("");
  const [linkEmailOtp, setLinkEmailOtp] = useState("");
  const [linkPhone, setLinkPhone] = useState("");
  const [linkPhoneOtp, setLinkPhoneOtp] = useState("");
  const [contactBusy, setContactBusy] = useState(false);

  const [officialName, setOfficialName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [presentDistrict, setPresentDistrict] = useState("");
  const [presentCity, setPresentCity] = useState("");
  const [presentLine, setPresentLine] = useState("");
  const [sameAddress, setSameAddress] = useState(true);
  const [permDistrict, setPermDistrict] = useState("");
  const [permCity, setPermCity] = useState("");
  const [permLine, setPermLine] = useState("");
  const [storyBefore, setStoryBefore] = useState("");
  const [storyJourney, setStoryJourney] = useState("");
  const [storyTransformation, setStoryTransformation] = useState("");
  const [storyMessage, setStoryMessage] = useState("");
  const [storyFeedback, setStoryFeedback] = useState("");
  const [publicConsent, setPublicConsent] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCertificationStatus();
      setStatus(data);
      if (data.application) {
        const a = data.application;
        setOfficialName(a.officialName);
        setDateOfBirth(a.dateOfBirth);
        setWhatsapp(a.whatsapp);
        setPresentDistrict(a.presentAddress.district);
        setPresentCity(a.presentAddress.city);
        setPresentLine(a.presentAddress.addressLine ?? "");
        setSameAddress(a.sameAsPresentAddress);
        setPermDistrict(a.permanentAddress.district);
        setPermCity(a.permanentAddress.city);
        setPermLine(a.permanentAddress.addressLine ?? "");
        setStoryBefore(a.storyBefore);
        setStoryJourney(a.storyJourney);
        setStoryTransformation(a.storyTransformation);
        setStoryMessage(a.storyMessage);
        setStoryFeedback(a.storyGamlishFeedback);
        setPublicConsent(a.publicStoryConsent);
      }
    } catch {
      setError("Could not load certification status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const contactReady = useMemo(
    () =>
      Boolean(
        status?.contact.hasVerifiedPhone && status?.contact.hasVerifiedEmail,
      ),
    [status],
  );

  const permanentAddress = useMemo(
    () =>
      sameAddress
        ? {
            district: presentDistrict,
            city: presentCity,
            addressLine: presentLine,
          }
        : {
            district: permDistrict,
            city: permCity,
            addressLine: permLine,
          },
    [sameAddress, presentDistrict, presentCity, presentLine, permDistrict, permCity, permLine],
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await submitCertificationApplication({
        officialName,
        dateOfBirth,
        whatsapp,
        presentAddress: {
          district: presentDistrict,
          city: presentCity,
          addressLine: presentLine,
        },
        permanentAddress,
        sameAsPresentAddress: sameAddress,
        storyBefore,
        storyJourney,
        storyTransformation,
        storyMessage,
        storyGamlishFeedback: storyFeedback,
        publicStoryConsent: publicConsent,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!status?.eligible) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <p className="font-semibold">Complete Mission 21 first</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Certification unlocks after you finish Fundamental English (Mission 21).
        </p>
        <Link href="/player" className="mt-6 inline-block">
          <Button>Go to camp map</Button>
        </Link>
      </Card>
    );
  }

  if (status.certificate) {
    return (
      <Card className="mx-auto max-w-xl space-y-4 p-8 text-center">
        <Award className="mx-auto h-12 w-12 text-amber-500" />
        <p className="text-xl font-bold">Your certificate is ready</p>
        <p className="text-sm text-muted-foreground">
          {status.certificate.officialName} · {status.certificate.certificateId}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/profile">
            <Button>View on profile</Button>
          </Link>
          <Link href={`/verify/${status.certificate.certificateId}`}>
            <Button variant="outline">Verification page</Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (status.application?.status === "submitted") {
    return (
      <Card className="mx-auto max-w-xl space-y-4 p-8 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
        <p className="text-xl font-bold">Application under review</p>
        <p className="text-sm text-muted-foreground">
          Gamlish is reviewing your certification application. You will receive your
          certificate after approval.
        </p>
      </Card>
    );
  }

  if (status.application?.status === "rejected") {
    return (
      <Card className="mx-auto max-w-xl space-y-4 p-8">
        <p className="text-xl font-bold text-destructive">Application not approved</p>
        {status.application.adminNote ? (
          <p className="text-sm text-muted-foreground">{status.application.adminNote}</p>
        ) : null}
        <p className="text-sm">Contact Gamlish support if you need help.</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Fundamental English Certification</h1>
        <p className="text-sm text-muted-foreground">
          Complete your verified profile. Gamlish will review before issuing your certificate.
        </p>
      </div>

      {status.application?.status === "changes_requested" &&
      status.application.changeRequestNote ? (
        <Card className="border-amber-300/50 bg-amber-50/80 p-4 text-sm dark:bg-amber-950/20">
          <p className="font-semibold">Please update your application</p>
          <p className="mt-1">{status.application.changeRequestNote}</p>
        </Card>
      ) : null}

      <div className="flex flex-wrap justify-center gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              step === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </Card>
      ) : null}

      <Card className="space-y-5 p-6">
        {step === 0 ? (
          <div className="space-y-4">
            <p className="font-semibold">Verified contact</p>
            <p className="text-sm text-muted-foreground">
              Both verified phone and Gmail are required for certification.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div
                className={cn(
                  "rounded-xl border p-4",
                  status.contact.hasVerifiedPhone
                    ? "border-emerald-300/50 bg-emerald-50/50"
                    : "border-border",
                )}
              >
                <p className="text-sm font-medium">Phone</p>
                <p className="text-xs text-muted-foreground">
                  {status.contact.hasVerifiedPhone
                    ? status.contact.phoneMasked
                    : "Not verified yet"}
                </p>
              </div>
              <div
                className={cn(
                  "rounded-xl border p-4",
                  status.contact.hasVerifiedEmail
                    ? "border-emerald-300/50 bg-emerald-50/50"
                    : "border-border",
                )}
              >
                <p className="text-sm font-medium">Gmail</p>
                <p className="text-xs text-muted-foreground">
                  {status.contact.hasVerifiedEmail
                    ? status.contact.email
                    : "Not verified yet"}
                </p>
              </div>
            </div>

            {!status.contact.hasVerifiedEmail ? (
              <div className="space-y-2 rounded-xl border p-4">
                <Label>Add & verify Gmail</Label>
                <Input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="you@gmail.com"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={contactBusy}
                    onClick={async () => {
                      setContactBusy(true);
                      try {
                        await requestCertificationLinkEmail(linkEmail);
                      } catch {
                        setError("Could not send email OTP.");
                      } finally {
                        setContactBusy(false);
                      }
                    }}
                  >
                    Send code
                  </Button>
                  <Input
                    value={linkEmailOtp}
                    onChange={(e) => setLinkEmailOtp(e.target.value)}
                    placeholder="OTP"
                  />
                  <Button
                    type="button"
                    disabled={contactBusy}
                    onClick={async () => {
                      setContactBusy(true);
                      try {
                        await verifyCertificationLinkEmail(linkEmail, linkEmailOtp);
                        await load();
                      } catch {
                        setError("Invalid email OTP.");
                      } finally {
                        setContactBusy(false);
                      }
                    }}
                  >
                    Verify
                  </Button>
                </div>
              </div>
            ) : null}

            {!status.contact.hasVerifiedPhone ? (
              <div className="space-y-2 rounded-xl border p-4">
                <Label>Add & verify phone (OTP)</Label>
                <Input
                  value={linkPhone}
                  onChange={(e) => setLinkPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={contactBusy}
                    onClick={async () => {
                      setContactBusy(true);
                      try {
                        await requestCertificationLinkPhone(linkPhone);
                      } catch {
                        setError("Could not send phone OTP.");
                      } finally {
                        setContactBusy(false);
                      }
                    }}
                  >
                    Send OTP
                  </Button>
                  <Input
                    value={linkPhoneOtp}
                    onChange={(e) => setLinkPhoneOtp(e.target.value)}
                    placeholder="OTP"
                  />
                  <Button
                    type="button"
                    disabled={contactBusy}
                    onClick={async () => {
                      setContactBusy(true);
                      try {
                        await verifyCertificationLinkPhone(linkPhone, linkPhoneOtp);
                        await load();
                      } catch {
                        setError("Invalid phone OTP.");
                      } finally {
                        setContactBusy(false);
                      }
                    }}
                  >
                    Verify
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <p className="font-semibold">Official identity</p>
            <p className="text-sm text-muted-foreground">
              Use the name on your NID or passport. This becomes your certificate name and
              cannot be changed after approval.
            </p>
            <div className="space-y-2">
              <Label>Official full name</Label>
              <Input value={officialName} onChange={(e) => setOfficialName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date of birth</Label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp number</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <p className="font-semibold">Address</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Present district</Label>
                <DistrictSelect
                  id="present-district"
                  value={presentDistrict}
                  onChange={setPresentDistrict}
                />
              </div>
              <div className="space-y-2">
                <Label>Present city / area</Label>
                <Input value={presentCity} onChange={(e) => setPresentCity(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Present address (optional)</Label>
              <Input value={presentLine} onChange={(e) => setPresentLine(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sameAddress}
                onChange={(e) => setSameAddress(e.target.checked)}
              />
              Permanent address is the same
            </label>
            {!sameAddress ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Permanent district</Label>
                  <DistrictSelect
                    id="perm-district"
                    value={permDistrict}
                    onChange={setPermDistrict}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permanent city / area</Label>
                  <Input value={permCity} onChange={(e) => setPermCity(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Permanent address (optional)</Label>
                  <Input value={permLine} onChange={(e) => setPermLine(e.target.value)} />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <p className="font-semibold">Your Gamlish story</p>
            <p className="text-sm text-muted-foreground">
              Write honestly in your own words. AI-generated text may delay or block certification.
            </p>
            {[
              ["Before Gamlish", storyBefore, setStoryBefore],
              ["Your journey", storyJourney, setStoryJourney],
              ["What changed", storyTransformation, setStoryTransformation],
              ["Message for future learners", storyMessage, setStoryMessage],
              ["How Gamlish can teach better", storyFeedback, setStoryFeedback],
            ].map(([label, val, setVal]) => (
              <div key={String(label)} className="space-y-2">
                <Label>{String(label)}</Label>
                <Textarea
                  rows={4}
                  value={String(val)}
                  onChange={(e) => (setVal as (v: string) => void)(e.target.value)}
                />
              </div>
            ))}
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={publicConsent}
                onChange={(e) => setPublicConsent(e.target.checked)}
              />
              I agree Gamlish may show my story on my public profile after approval (optional).
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3 text-sm">
            <p className="font-semibold">Review before submit</p>
            <p>
              <span className="text-muted-foreground">Name:</span> {officialName}
            </p>
            <p>
              <span className="text-muted-foreground">DOB:</span> {dateOfBirth}
            </p>
            <p>
              <span className="text-muted-foreground">District:</span> {presentDistrict},{" "}
              {presentCity}
            </p>
            <p className="text-muted-foreground">
              After Gamlish approves, your official name will replace your display name on your
              profile. Your @username will not change.
            </p>
          </div>
        ) : null}

        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => {
                if (step === 0 && !contactReady) {
                  setError("Verify phone and Gmail first.");
                  return;
                }
                setError(null);
                setStep((s) => s + 1);
              }}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={submitting || !contactReady}
              onClick={() => void handleSubmit()}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Submit for review
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
