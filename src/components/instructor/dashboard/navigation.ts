import {
  BarChart3,
  BookOpen,
  Activity,
  FolderKanban,
  Hash,
  FileText,
  Layers,
  FileQuestion,
  Tag,
  type LucideIcon,
} from "lucide-react";

export interface InstructorNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface InstructorNavGroup {
  title: string;
  items: InstructorNavItem[];
}

export const instructorNavGroups: InstructorNavGroup[] = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", href: "/dashboard/instructor", icon: BarChart3 },
      { label: "Reading Levels", href: "/dashboard/instructor/reading-levels", icon: BookOpen },
      { label: "Reading Monitoring", href: "/dashboard/instructor/reading-monitoring", icon: Activity },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { label: "Content Management", href: "/dashboard/instructor/contents", icon: FolderKanban },
      { label: "Passage Codes", href: "/dashboard/instructor/passage-codes", icon: Hash },
      { label: "Passages", href: "/dashboard/instructor/passages", icon: FileText },
      { label: "Question Sets", href: "/dashboard/instructor/question-sets", icon: Layers },
      { label: "Questions", href: "/dashboard/instructor/questions", icon: FileQuestion },
      { label: "Weakness Tags", href: "/dashboard/instructor/weakness-tags", icon: Tag },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard/instructor": "Dashboard",
  "/dashboard/instructor/reading-levels": "Reading Levels",
  "/dashboard/instructor/reading-monitoring": "Reading Monitoring",
  "/dashboard/instructor/contents": "Content Management",
  "/dashboard/instructor/passage-codes": "Passage Codes",
  "/dashboard/instructor/passages": "Passages",
  "/dashboard/instructor/question-sets": "Question Sets",
  "/dashboard/instructor/questions": "Questions",
  "/dashboard/instructor/weakness-tags": "Weakness Tags",
  "/dashboard/instructor/profile": "Profile",
};

export function getInstructorPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.match(/\/reading-levels\/[^/]+\/edit$/)) return "Level Builder";
  const matchedPath = Object.keys(PAGE_TITLES)
    .filter((path) => path !== "/dashboard/instructor" && pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];
  if (matchedPath && PAGE_TITLES[matchedPath]) return PAGE_TITLES[matchedPath];
  return "Instructor";
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard/instructor") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
