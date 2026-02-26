"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ChevronRight,
  Hash,
  List,
  FileQuestion,
  Layers,
  Tag,
  User,
  BookOpen,
  FolderOpen,
} from "lucide-react";

const contentLinks = [
  {
    href: "/dashboard/instructor/levels",
    icon: <BookOpen className="h-5 w-5 text-stone-600 dark:text-stone-400" />,
    title: "Level Management",
    desc: "View, create, and edit levels. Manage steps (intro, video, quiz, practice, full test) and reorder them.",
    accent: "bg-stone-100 dark:bg-stone-800",
    cta: "Manage Levels",
  },
  {
    href: "/dashboard/instructor/contents",
    icon: <FolderOpen className="h-5 w-5 text-stone-600 dark:text-stone-400" />,
    title: "Content Management",
    desc: "Create and manage intro, note, video, and analytics content. Reuse in Level → Step Builder.",
    accent: "bg-stone-100 dark:bg-stone-800",
    cta: "Manage",
  },
  {
    href: "/dashboard/instructor/passage-codes",
    icon: <Hash className="h-5 w-5 text-stone-600 dark:text-stone-400" />,
    title: "Passage codes",
    desc: "Create passage identifiers (book, test, passage). Required first step.",
    accent: "bg-stone-100 dark:bg-stone-800",
    cta: "Manage",
  },
  {
    href: "/dashboard/instructor/passages",
    icon: <FileText className="h-5 w-5 text-stone-600 dark:text-stone-400" />,
    title: "Passages",
    desc: "Create and edit reading passages with paragraphs and metadata.",
    accent: "bg-stone-100 dark:bg-stone-800",
    cta: "Manage",
  },
  {
    href: "/dashboard/instructor/question-sets",
    icon: <List className="h-5 w-5 text-stone-600 dark:text-stone-400" />,
    title: "Question sets",
    desc: "Create question groups (MCQ, TFNG, matching, etc.) for passages.",
    accent: "bg-stone-100 dark:bg-stone-800",
    cta: "Manage",
  },
  {
    href: "/dashboard/instructor/questions",
    icon: <FileQuestion className="h-5 w-5 text-stone-600 dark:text-stone-400" />,
    title: "Questions",
    desc: "Add individual questions to question sets.",
    accent: "bg-stone-100 dark:bg-stone-800",
    cta: "Manage",
  },
  {
    href: "/dashboard/instructor/passage-question-sets",
    icon: <Layers className="h-5 w-5 text-stone-600 dark:text-stone-400" />,
    title: "Passage question sets",
    desc: "Link passages + codes + question groups. Creates tests for students.",
    accent: "bg-stone-100 dark:bg-stone-800",
    cta: "Manage",
  },
  {
    href: "/dashboard/instructor/weakness-tags",
    icon: <Tag className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    title: "Weakness / Trap tags",
    desc: "Submit and manage weakness tags to assign to questions and track student mistakes.",
    accent: "bg-amber-500/10 dark:bg-amber-500/20",
    cta: "Manage",
  },
];

export default function InstructorDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Instructor dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Manage reading content. Passage codes → passages → question sets → questions → passage question sets.
          </p>
        </div>
        <Link href="/dashboard/instructor/profile">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <User className="h-4 w-4" />
            My profile
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contentLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full rounded-2xl border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900/50">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${link.accent}`}
                >
                  {link.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                    {link.title}
                  </h2>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    {link.desc}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 gap-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                  >
                    {"cta" in link ? link.cta : "Manage"}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="rounded-2xl border-stone-200 bg-stone-50/50 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/30">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">
          Content creation order
        </h3>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          1. Passage codes → 2. Passages → 3. Question sets → 4. Questions → 5. Passage question sets.
          Admins can publish content so students can take tests.
        </p>
      </Card>
    </div>
  );
}
