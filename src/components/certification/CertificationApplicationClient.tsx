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
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BANGLADESH_DISTRICTS } from "@/src/lib/constants/bangladesh-districts";
import { DateOfBirthFields } from "@/src/components/certification/DateOfBirthFields";
import { formatDobDisplay } from "@/src/lib/date-of-birth";
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

const STORY_MIN = {
  before: 40,
  journey: 40,
  transformation: 40,
  message: 20,
  feedback: 20,
} as const;

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

function RemoveExtraAccountDialog({
  channel,
  value,
  onCancel,
  onConfirm,
}: {
  channel: "email" | "phone";
  value: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isEmail = channel === "email";
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-extra-account-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-amber-400/40 bg-card p-5 shadow-2xl">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
          <TriangleAlert className="h-5 w-5" />
        </div>
        <h2 id="remove-extra-account-title" className="text-center text-lg font-semibold">
          {isEmail ? "Another account uses this Gmail" : "Another account uses this phone"}
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
          {isEmail ? (
            <>
              A Gamlish account already exists with{" "}
              <span className="font-medium text-foreground">{value}</span>. That unpaid extra
              account will be permanently removed after you verify the code. This Gmail will then
              belong only to the account you are using now.
            </>
          ) : (
            <>
              A Gamlish account already exists with{" "}
              <span className="font-medium text-foreground">{value}</span>. That unpaid extra
              account will be permanently removed after you verify the OTP. This number will then
              belong only to the account you are using now.
            </>
          )}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            {isEmail ? "Use a different Gmail" : "Use a different number"}
          </Button>
          <Button type="button" onClick={onConfirm}>
            Yes, remove extra account
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExtraAccountWarning({
  channel,
  value,
  confirmed,
  onConfirmChange,
}: {
  channel: "email" | "phone";
  value: string;
  confirmed: boolean;
  onConfirmChange: (next: boolean) => void;
}) {
  const isEmail = channel === "email";
  return (
    <div className="space-y-2 rounded-xl border border-amber-400/50 bg-amber-50/80 p-3 dark:bg-amber-950/20">
      <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
        Another unpaid account uses {value}.
      </p>
      <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
        After you verify, that extra account will be removed and this {isEmail ? "Gmail" : "number"}{" "}
        will stay on the account applying for the certificate.
      </p>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={confirmed}
          onChange={(e) => onConfirmChange(e.target.checked)}
        />
        <span>I understand. Remove the extra account after I verify.</span>
      </label>
    </div>
  );
}

function StoryField({
  label,
  hint,
  value,
  min,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  min: number;
  onChange: (v: string) => void;
}) {
  const count = value.trim().length;
  const ok = count >= min;
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <Label>{label}</Label>
        <span
          className={cn(
            "text-[11px] tabular-nums",
            ok ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground",
          )}
        >
          {count}/{min}
        </span>
      </div>
      <Textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function CertificationApplicationClient() {
  const [status, setStatus] = useState<CertificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [linkEmail, setLinkEmail] = useState("");
  const [linkEmailOtp, setLinkEmailOtp] = useState("");
  const [linkPhone, setLinkPhone] = useState("");
  const [linkPhoneOtp, setLinkPhoneOtp] = useState("");
  const [contactBusy, setContactBusy] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [emailWillRemove, setEmailWillRemove] = useState(false);
  const [emailRemovalConfirmed, setEmailRemovalConfirmed] = useState(false);
  const [phoneWillRemove, setPhoneWillRemove] = useState(false);
  const [phoneRemovalConfirmed, setPhoneRemovalConfirmed] = useState(false);
  const [removalPrompt, setRemovalPrompt] = useState<{
    channel: "email" | "phone";
    value: string;
  } | null>(null);

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

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const id = window.setInterval(() => {
      setOtpCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [otpCooldown]);

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
      } else {
        setOfficialName((prev) => prev || data.suggestedOfficialName || "");
        setWhatsapp((prev) => prev || data.contact.phoneLocal || "");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load certification status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const contactReady = useMemo(
    () => Boolean(status?.contact.hasVerifiedPhone && status?.contact.hasVerifiedEmail),
    [status],
  );

  const identityReady =
    officialName.trim().length >= 3 &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) &&
    whatsapp.replace(/\D/g, "").length >= 10;

  const addressReady =
    Boolean(presentDistrict && presentCity.trim().length >= 2) &&
    (sameAddress || Boolean(permDistrict && permCity.trim().length >= 2));

  const storyReady =
    storyBefore.trim().length >= STORY_MIN.before &&
    storyJourney.trim().length >= STORY_MIN.journey &&
    storyTransformation.trim().length >= STORY_MIN.transformation &&
    storyMessage.trim().length >= STORY_MIN.message &&
    storyFeedback.trim().length >= STORY_MIN.feedback;

  const stepReady = [contactReady, identityReady, addressReady, storyReady, true];

  const permanentAddress = useMemo(
    () =>
      sameAddress
        ? {
            district: presentDistrict,
            city: presentCity,
            addressLine: presentLine.trim() || undefined,
          }
        : {
            district: permDistrict,
            city: permCity,
            addressLine: permLine.trim() || undefined,
          },
    [sameAddress, presentDistrict, presentCity, presentLine, permDistrict, permCity, permLine],
  );

  const goNext = () => {
    if (step === 0 && !contactReady) {
      setError("Verify both your phone and Gmail before continuing.");
      return;
    }
    if (step === 1 && !identityReady) {
      setError("Enter your official name, date of birth, and WhatsApp number.");
      return;
    }
    if (step === 2 && !addressReady) {
      setError("Select your district and enter your city or area.");
      return;
    }
    if (step === 3 && !storyReady) {
      setError("Complete every story field. Short answers cannot be submitted.");
      return;
    }
    setError(null);
    setInfo(null);
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!contactReady) {
      setStep(0);
      setError("Verify both your phone and Gmail before submitting.");
      return;
    }
    if (!identityReady || !addressReady || !storyReady) {
      setError("Complete every step before submitting.");
      return;
    }
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
          addressLine: presentLine.trim() || undefined,
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
        <Link href="/player">
          <Button variant="outline">Back to camp map</Button>
        </Link>
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Graduate next step
        </p>
        <h1 className="text-2xl font-bold">Claim your Fundamental English certificate</h1>
        <p className="text-sm text-muted-foreground">
          Verify your contact, confirm your identity, then submit for Gamlish review.
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
        {STEPS.map((label, i) => {
          const unlocked = i <= step || (i > 0 && stepReady[i - 1]);
          return (
            <button
              key={label}
              type="button"
              disabled={!unlocked}
              onClick={() => {
                if (!unlocked) return;
                setError(null);
                setInfo(null);
                setStep(i);
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                step === i
                  ? "bg-primary text-primary-foreground"
                  : unlocked
                    ? "bg-muted text-foreground"
                    : "cursor-not-allowed bg-muted/60 text-muted-foreground",
              )}
            >
              {i + 1}. {label}
            </button>
          );
        })}
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </Card>
      ) : null}
      {info ? (
        <Card className="border-emerald-300/40 bg-emerald-50/70 p-3 text-sm text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200">
          {info}
        </Card>
      ) : null}

      <Card className="space-y-5 p-6">
        {step === 0 ? (
          <div className="space-y-4">
            <p className="font-semibold">Verified contact</p>
            <p className="text-sm text-muted-foreground">
              Both verified phone and Gmail are required. We send a one-time code. No password
              change.
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
                  {status.contact.hasVerifiedEmail ? status.contact.email : "Not verified yet"}
                </p>
              </div>
            </div>

            {!status.contact.hasVerifiedEmail ? (
              <div className="space-y-2 rounded-xl border p-4">
                <Label>Add and verify Gmail</Label>
                <Input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => {
                    setLinkEmail(e.target.value);
                    setEmailWillRemove(false);
                    setEmailRemovalConfirmed(false);
                    setEmailOtpSent(false);
                  }}
                  placeholder="you@gmail.com"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={contactBusy}
                    onClick={async () => {
                      setContactBusy(true);
                      setError(null);
                      try {
                        const sent = await requestCertificationLinkEmail(linkEmail);
                        setEmailOtpSent(true);
                        const willRemove = Boolean(sent.willRemoveUnusedAccount);
                        setEmailWillRemove(willRemove);
                        setEmailRemovalConfirmed(false);
                        if (willRemove) {
                          setRemovalPrompt({ channel: "email", value: linkEmail.trim() });
                          setInfo("Code sent. Confirm the extra-account warning before you verify.");
                        } else {
                          setInfo("Code sent to your Gmail. It expires in 5 minutes.");
                        }
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Could not send the email code.");
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
                    placeholder="6-digit code"
                    inputMode="numeric"
                  />
                  <Button
                    type="button"
                    disabled={
                      contactBusy ||
                      !emailOtpSent ||
                      (emailWillRemove && !emailRemovalConfirmed)
                    }
                    onClick={async () => {
                      if (emailWillRemove && !emailRemovalConfirmed) {
                        setRemovalPrompt({ channel: "email", value: linkEmail.trim() });
                        return;
                      }
                      setContactBusy(true);
                      setError(null);
                      try {
                        const verified = await verifyCertificationLinkEmail(linkEmail, linkEmailOtp);
                        setEmailWillRemove(false);
                        setEmailRemovalConfirmed(false);
                        setInfo(
                          verified.unusedAccountRemoved
                            ? "Gmail verified. The unpaid extra account was removed."
                            : "Gmail verified.",
                        );
                        await load();
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Invalid email code.");
                      } finally {
                        setContactBusy(false);
                      }
                    }}
                  >
                    Verify
                  </Button>
                </div>
                {emailWillRemove ? (
                  <ExtraAccountWarning
                    channel="email"
                    value={linkEmail.trim()}
                    confirmed={emailRemovalConfirmed}
                    onConfirmChange={setEmailRemovalConfirmed}
                  />
                ) : null}
              </div>
            ) : null}

            {!status.contact.hasVerifiedPhone ? (
              <div className="space-y-2 rounded-xl border p-4">
                <Label>Add and verify phone (SMS OTP)</Label>
                <Input
                  value={linkPhone}
                  onChange={(e) => {
                    setLinkPhone(e.target.value);
                    setPhoneWillRemove(false);
                    setPhoneRemovalConfirmed(false);
                    setPhoneOtpSent(false);
                  }}
                  placeholder="01XXXXXXXXX"
                  inputMode="tel"
                />
                <p className="text-xs text-muted-foreground">
                  Use a Bangladesh number. You can request a new code every 60 seconds.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={contactBusy || otpCooldown > 0}
                    onClick={async () => {
                      setContactBusy(true);
                      setError(null);
                      try {
                        const sent = await requestCertificationLinkPhone(linkPhone);
                        setPhoneOtpSent(true);
                        setOtpCooldown(60);
                        const willRemove = Boolean(sent.willRemoveUnusedAccount);
                        setPhoneWillRemove(willRemove);
                        setPhoneRemovalConfirmed(false);
                        if (willRemove) {
                          setRemovalPrompt({ channel: "phone", value: linkPhone.trim() });
                          setInfo("OTP sent. Confirm the extra-account warning before you verify.");
                        } else {
                          setInfo("OTP sent by SMS. Enter it below. Valid for 5 minutes.");
                        }
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Could not send the phone OTP.");
                      } finally {
                        setContactBusy(false);
                      }
                    }}
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Send OTP"}
                  </Button>
                  <Input
                    value={linkPhoneOtp}
                    onChange={(e) => setLinkPhoneOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    inputMode="numeric"
                  />
                  <Button
                    type="button"
                    disabled={
                      contactBusy ||
                      !phoneOtpSent ||
                      (phoneWillRemove && !phoneRemovalConfirmed)
                    }
                    onClick={async () => {
                      if (phoneWillRemove && !phoneRemovalConfirmed) {
                        setRemovalPrompt({ channel: "phone", value: linkPhone.trim() });
                        return;
                      }
                      setContactBusy(true);
                      setError(null);
                      try {
                        const verified = await verifyCertificationLinkPhone(linkPhone, linkPhoneOtp);
                        setPhoneWillRemove(false);
                        setPhoneRemovalConfirmed(false);
                        setInfo(
                          verified.unusedAccountRemoved
                            ? "Phone verified. The unpaid extra account was removed."
                            : "Phone verified.",
                        );
                        if (!whatsapp.trim()) setWhatsapp(linkPhone);
                        await load();
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Invalid phone OTP.");
                      } finally {
                        setContactBusy(false);
                      }
                    }}
                  >
                    Verify
                  </Button>
                </div>
                {phoneWillRemove ? (
                  <ExtraAccountWarning
                    channel="phone"
                    value={linkPhone.trim()}
                    confirmed={phoneRemovalConfirmed}
                    onConfirmChange={setPhoneRemovalConfirmed}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <p className="font-semibold">Official identity</p>
            <p className="text-sm text-muted-foreground">
              Use the name on your NID or passport. This becomes your certificate name and cannot be
              changed after approval.
            </p>
            <div className="space-y-2">
              <Label>Official full name</Label>
              <Input value={officialName} onChange={(e) => setOfficialName(e.target.value)} />
            </div>
            <DateOfBirthFields value={dateOfBirth} onChange={setDateOfBirth} />
            <div className="space-y-2">
              <Label>WhatsApp number</Label>
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="01XXXXXXXXX"
                inputMode="tel"
              />
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
              Write honestly in your own words. Short answers will be rejected. AI-generated text
              may delay certification.
            </p>
            <StoryField
              label="Before Gamlish"
              hint="What was hard about English before you started?"
              value={storyBefore}
              min={STORY_MIN.before}
              onChange={setStoryBefore}
            />
            <StoryField
              label="Your journey"
              hint="What did you actually do on Gamlish?"
              value={storyJourney}
              min={STORY_MIN.journey}
              onChange={setStoryJourney}
            />
            <StoryField
              label="What changed"
              hint="What can you do now that you could not do before?"
              value={storyTransformation}
              min={STORY_MIN.transformation}
              onChange={setStoryTransformation}
            />
            <StoryField
              label="Message for future learners"
              hint="One honest line for the next student."
              value={storyMessage}
              min={STORY_MIN.message}
              onChange={setStoryMessage}
            />
            <StoryField
              label="How Gamlish can teach better"
              hint="What should we improve?"
              value={storyFeedback}
              min={STORY_MIN.feedback}
              onChange={setStoryFeedback}
            />
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
              <span className="text-muted-foreground">Date of birth:</span>{" "}
              {formatDobDisplay(dateOfBirth)}
            </p>
            <p>
              <span className="text-muted-foreground">WhatsApp:</span> {whatsapp}
            </p>
            <p>
              <span className="text-muted-foreground">District:</span> {presentDistrict},{" "}
              {presentCity}
            </p>
            <p>
              <span className="text-muted-foreground">Contact:</span>{" "}
              {status.contact.phoneMasked} · {status.contact.email}
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
            onClick={() => {
              setError(null);
              setInfo(null);
              setStep((s) => Math.max(0, s - 1));
            }}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={submitting || !contactReady || !identityReady || !addressReady || !storyReady}
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
      {removalPrompt ? (
        <RemoveExtraAccountDialog
          channel={removalPrompt.channel}
          value={removalPrompt.value}
          onCancel={() => {
            if (removalPrompt.channel === "email") {
              setEmailOtpSent(false);
              setEmailWillRemove(false);
              setEmailRemovalConfirmed(false);
              setLinkEmailOtp("");
            } else {
              setPhoneOtpSent(false);
              setPhoneWillRemove(false);
              setPhoneRemovalConfirmed(false);
              setLinkPhoneOtp("");
            }
            setRemovalPrompt(null);
            setInfo(null);
          }}
          onConfirm={() => {
            if (removalPrompt.channel === "email") setEmailRemovalConfirmed(true);
            else setPhoneRemovalConfirmed(true);
            setRemovalPrompt(null);
          }}
        />
      ) : null}
    </div>
  );
}
