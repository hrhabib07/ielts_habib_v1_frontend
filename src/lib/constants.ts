import { GAMLISH_BRAND } from "@/src/lib/gamlish-brand";

export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

/** Single transparent logo — same asset in light/dark; no wrapper, no alternate dark file. */
const GAMLISH_LOGO_URL = "/brand/gamlish-logo.png";

export const BRAND = {
  logoUrl: GAMLISH_LOGO_URL,
  navLogoUrl: GAMLISH_LOGO_URL,
  iconMarkUrl: GAMLISH_LOGO_URL,
  tagline: GAMLISH_BRAND.taglineLine2,
  headline: GAMLISH_BRAND.heroLine,
  subheadline: GAMLISH_BRAND.metaDescription,
  cta: "Mission 01 ফ্রি শুরু করো",
  heroSubtext: "খেলার ছলেই ইংরেজি শেখো। মিশন পার করলেই এগিয়ে যাও।",
} as const;

interface MenuItem {
  label: string;
  href: string;
  roles: UserRole[];
}

export const DASHBOARD_MENU: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard/student",
    roles: ["STUDENT"],
  },
  {
    label: "Apply as Instructor",
    href: "/dashboard/student/instructor-request",
    roles: ["STUDENT"],
  },
  {
    label: "Instructor Dashboard",
    href: "/dashboard/instructor",
    roles: ["INSTRUCTOR"],
  },
  {
    label: "Level Management",
    href: "/dashboard/instructor/levels",
    roles: ["INSTRUCTOR"],
  },
  {
    label: "Admin Dashboard",
    href: "/dashboard/admin",
    roles: ["ADMIN"],
  },
  {
    label: "Instructor Requests",
    href: "/dashboard/admin/instructor-requests",
    roles: ["ADMIN"],
  },
];
