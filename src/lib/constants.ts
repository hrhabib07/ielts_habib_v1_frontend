export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

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
