"use client";

import { useMemo } from "react";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { AUTH_RECOVERY_COPY, PROFILE_PASSWORD_COPY } from "@/src/lib/auth-recovery-copy";
import { AUTH_REGISTER_COPY } from "@/src/lib/auth-register-copy";
import { FOUNDER_BENEFITS_COPY } from "@/src/lib/founder-benefits-copy";
import { FOUNDER_LAUNCH_COPY } from "@/src/lib/founder-launch-copy";
import { GUEST_LANDING_COPY } from "@/src/lib/guest-landing-copy";
import { ONBOARDING_COPY } from "@/src/lib/onboarding-copy";
import { PLAYER_UI_COPY } from "@/src/lib/player-ui-copy";
import { PRICING_FAQ_COPY } from "@/src/lib/pricing-faq-copy";
import { PROFILE_PAGE_COPY } from "@/src/lib/profile-page-copy";
import { SITE_SHELL_COPY } from "@/src/lib/site-shell-copy";
import { SQUAD_UI_COPY } from "@/src/lib/squad-ui-copy";
import { STUDENT_HOME_COPY } from "@/src/lib/student-home-copy";
import { USERNAME_FLOW_COPY } from "@/src/lib/username-flow-copy";

export function useSiteShellCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => SITE_SHELL_COPY[locale], [locale]);
}

export function usePlayerUiCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => PLAYER_UI_COPY[locale], [locale]);
}

export function useSquadUiCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => SQUAD_UI_COPY[locale], [locale]);
}

export function useStudentHomeCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => STUDENT_HOME_COPY[locale], [locale]);
}

export function useGuestLandingCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => GUEST_LANDING_COPY[locale], [locale]);
}

export function useProfilePageCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => PROFILE_PAGE_COPY[locale], [locale]);
}

export function useAuthRegisterCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => AUTH_REGISTER_COPY[locale], [locale]);
}

export function useFounderLaunchCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => FOUNDER_LAUNCH_COPY[locale], [locale]);
}

export function useFounderBenefitsCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => FOUNDER_BENEFITS_COPY[locale], [locale]);
}

export function usePricingFaqCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => PRICING_FAQ_COPY[locale], [locale]);
}

export function useOnboardingCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => ONBOARDING_COPY[locale], [locale]);
}

export function useUsernameFlowCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => USERNAME_FLOW_COPY[locale], [locale]);
}

export function useAuthRecoveryCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => AUTH_RECOVERY_COPY[locale], [locale]);
}

export function useProfilePasswordCopy() {
  const { locale } = useUiLocale();
  return useMemo(() => PROFILE_PASSWORD_COPY[locale], [locale]);
}
