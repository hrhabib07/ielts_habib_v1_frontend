import {
  Activity,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileQuestion,
  FileText,
  FolderKanban,
  Gamepad2,
  Hash,
  Layers,
  LayoutDashboard,
  ListChecks,
  Settings,
  Tag,
  UserCheck,
  Users,
  MessageSquareHeart,
} from "lucide-react";
import type { UserRole } from "@/src/lib/constants";
import type { DashboardNavGroup } from "@/src/components/dashboard/DashboardSidebar";

const INSTRUCTOR_MAIN: DashboardNavGroup = {
  title: "MAIN",
  roles: ["INSTRUCTOR", "ADMIN"],
  items: [
    { label: "Dashboard", href: "/dashboard/instructor", icon: BarChart3 },
    { label: "Reading Levels", href: "/dashboard/instructor/reading-levels", icon: BookOpen },
    { label: "Reading Monitoring", href: "/dashboard/instructor/reading-monitoring", icon: Activity },
  ],
};

const INSTRUCTOR_CONTENT: DashboardNavGroup = {
  title: "CONTENT",
  roles: ["INSTRUCTOR", "ADMIN"],
  items: [
    { label: "Practice Test Manager", href: "/dashboard/instructor/practice-tests", icon: ClipboardCheck },
    { label: "Group Tests", href: "/dashboard/instructor/group-tests", icon: ListChecks },
    { label: "Passage Codes", href: "/dashboard/instructor/passage-codes", icon: Hash },
    { label: "Passages", href: "/dashboard/instructor/passages", icon: FileText },
    { label: "Question Sets", href: "/dashboard/instructor/question-sets", icon: Layers },
    { label: "Questions", href: "/dashboard/instructor/questions", icon: FileQuestion },
    { label: "Passage Question Sets", href: "/dashboard/instructor/passage-question-sets", icon: Layers },
    { label: "Weakness Tags", href: "/dashboard/instructor/weakness-tags", icon: Tag },
  ],
};

const READING_ADMIN_NAV: DashboardNavGroup = {
  title: "ADMIN",
  roles: ["ADMIN"],
  items: [
    { label: "Admin Home", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Levels", href: "/dashboard/admin/levels", icon: BookOpen },
    { label: "Content", href: "/dashboard/admin/content", icon: FolderKanban },
    { label: "Weakness Tags", href: "/dashboard/admin/weakness-tags", icon: Tag },
    { label: "Demo feedback", href: "/dashboard/admin/demo-feedback", icon: MessageSquareHeart },
    { label: "Pricing & payments", href: "/dashboard/admin/pricing", icon: Settings },
    { label: "Instructor Requests", href: "/admin/instructor-requests", icon: UserCheck },
  ],
};

const ENGLISH_ADMIN_NAV: DashboardNavGroup = {
  title: "ENGLISH",
  roles: ["ADMIN"],
  items: [
    { label: "Admin Home", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Course & Missions", href: "/dashboard/admin/english", icon: Gamepad2 },
    { label: "Students", href: "/dashboard/admin/users", icon: Users },
    { label: "Demo feedback", href: "/dashboard/admin/demo-feedback", icon: MessageSquareHeart },
    { label: "Pricing & payments", href: "/dashboard/admin/pricing", icon: Settings },
    { label: "Instructor Requests", href: "/admin/instructor-requests", icon: UserCheck },
  ],
};

export function getDashboardNavGroups(role: UserRole, enableReading: boolean): DashboardNavGroup[] {
  if (role === "ADMIN") {
    if (enableReading) {
      return [INSTRUCTOR_MAIN, INSTRUCTOR_CONTENT, READING_ADMIN_NAV];
    }
    return [ENGLISH_ADMIN_NAV];
  }

  if (role === "INSTRUCTOR") {
    if (enableReading) {
      return [INSTRUCTOR_MAIN, INSTRUCTOR_CONTENT];
    }
    return [
      {
        title: "MAIN",
        roles: ["INSTRUCTOR"],
        items: [{ label: "Dashboard", href: "/dashboard/instructor", icon: BarChart3 }],
      },
    ];
  }

  return [];
}
