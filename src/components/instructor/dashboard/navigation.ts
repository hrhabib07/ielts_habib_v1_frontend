import {
  BarChart3,
  BookOpen,
  Activity,
  Users,
  Hash,
  FileText,
  Layers,
  FileQuestion,
  Tag,
  ListChecks,
  ClipboardCheck,
  BookMarked,
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
      { label: "Students", href: "/dashboard/instructor/reading-monitoring", icon: Users },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { label: "Lessons (Notes & Quizzes)", href: "/dashboard/instructor/lessons", icon: BookMarked },
      { label: "Practice Test Manager", href: "/dashboard/instructor/practice-tests", icon: ClipboardCheck },
      { label: "Group Tests", href: "/dashboard/instructor/group-tests", icon: ListChecks },
      { label: "Passage Codes", href: "/dashboard/instructor/passage-codes", icon: Hash },
      { label: "Passages", href: "/dashboard/instructor/passages", icon: FileText },
      { label: "Question Sets", href: "/dashboard/instructor/question-sets", icon: Layers },
      { label: "Questions", href: "/dashboard/instructor/questions", icon: FileQuestion },
      { label: "Passage Question Sets", href: "/dashboard/instructor/passage-question-sets", icon: Layers },
      { label: "Weakness Tags", href: "/dashboard/instructor/weakness-tags", icon: Tag },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard/instructor": "Dashboard",
  "/dashboard/instructor/reading-levels": "Reading Levels",
  "/dashboard/instructor/reading-monitoring": "Reading Monitoring",
  "/dashboard/instructor/students": "Student Detail",
  "/dashboard/instructor/lessons": "Lessons (Notes & Micro-quizzes)",
  "/dashboard/instructor/practice-tests": "Practice Test Manager",
  "/dashboard/instructor/group-tests": "Group Tests",
  "/dashboard/instructor/passage-codes": "Passage Codes",
  "/dashboard/instructor/passages": "Passages",
  "/dashboard/instructor/question-sets": "Question Sets",
  "/dashboard/instructor/questions": "Questions",
  "/dashboard/instructor/passage-question-sets": "Passage Question Sets",
  "/dashboard/instructor/weakness-tags": "Weakness Tags",
  "/dashboard/instructor/profile": "Profile",
};

export function getInstructorPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.match(/\/reading-levels\/[^/]+\/edit$/)) return "Level Builder";
  if (pathname.match(/\/reading-levels\/[^/]+\/versions\/[^/]+\/edit$/)) return "Edit Version";
  if (pathname.match(/\/reading-levels\/[^/]+\/versions$/)) return "Version History";
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
