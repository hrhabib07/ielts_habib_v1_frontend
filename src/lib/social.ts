/** Official Gamlish social profiles — single source of truth. */
export const GAMLISH_SOCIAL_LINKS = [
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/gamlishapp",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/gamlishapp/",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@gamlish1",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@gamlish",
  },
] as const;

export type GamlishSocialId = (typeof GAMLISH_SOCIAL_LINKS)[number]["id"];
