export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export const BRAND = {
  logoUrl:
    "https://res.cloudinary.com/daqvhd097/image/upload/v1772646945/gamlish_logo-no-bg_rr1d5e.png",
  tagline: "The Game of English",
  headline: "The Game of English",
  subheadline:
    "Performance-driven English mastery. Skill trees. Clearance. Proof.",
  cta: "Begin Initial Calibration",
  heroSubtext: "No videos to watch. Only levels to clear.",
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
