export type GuestHowItWorksSkillIcon =
  | "zap"
  | "clock"
  | "wind"
  | "book"
  | "trending";

export type GuestHowItWorksPillarIcon = "clock" | "focus" | "brain";

export interface GuestLandingZoneMockCopy {
  readonly zoneLabel: string;
  readonly title: string;
}

export interface GuestHowItWorksPillar {
  readonly title: string;
  readonly icon: GuestHowItWorksPillarIcon;
}

export interface GuestHowItWorksSkill {
  readonly label: string;
  readonly icon: GuestHowItWorksSkillIcon;
}

export interface GuestHowGamlishWorksCopy {
  readonly videoEyebrow: string;
  readonly videoTitle: string;
  readonly videoSubtitle: string;
  readonly videoPlaceholderTitle: string;
  readonly videoPlaceholderBody: string;
  readonly pillarsTitle: string;
  readonly examPillars: readonly GuestHowItWorksPillar[];
  readonly levelsTitle: string;
  readonly levelsLine: string;
  readonly levelsBadge: string;
  readonly skillsTitle: string;
  readonly skills: readonly GuestHowItWorksSkill[];
  readonly bottomCtaTitle: string;
  readonly bottomCtaSub: string;
}
