export type GuestHowItWorksStepIcon = "play" | "badge" | "save";

export interface GuestLandingZoneMockCopy {
  readonly zoneLabel: string;
  readonly title: string;
  readonly freeStart?: boolean;
}

export interface GuestHowItWorksStep {
  readonly icon: GuestHowItWorksStepIcon;
  readonly title: string;
  readonly description: string;
}

export interface GuestHowGamlishWorksCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly steps: readonly GuestHowItWorksStep[];
  readonly bottomCtaTitle: string;
  readonly bottomCtaSub: string;
}
