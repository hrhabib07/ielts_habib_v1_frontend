export type GuestHowItWorksStepIcon =
  | "gamepad"
  | "userPlus"
  | "shieldCheck"
  | "play"
  | "unlock";

export interface GuestLandingZoneMockCopy {
  readonly zoneLabel: string;
  readonly title: string;
}

export interface GuestHowItWorksStep {
  readonly icon: GuestHowItWorksStepIcon;
  readonly title: string;
  readonly description: string;
}

export interface GuestHowItWorksSquadTeaser {
  readonly title: string;
  readonly description: string;
  readonly badge: string;
}

export interface GuestHowGamlishWorksCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly steps: readonly GuestHowItWorksStep[];
  readonly squad: GuestHowItWorksSquadTeaser;
  readonly bottomCtaTitle: string;
  readonly bottomCtaSub: string;
}
