"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  ArrowLeft,
  ChevronRight,
  Hash,
  List,
  FileQuestion,
  Layers,
} from "lucide-react";

const contentLinks = [
  {
    href: "/dashboard/instructor/passage-codes",
    icon: <Hash className="h-5 w-5 text-primary" />,
    title: "Passage codes",
    desc: "Create passage identifiers (book, test, passage). Required first step.",
  },
  {
    href: "/dashboard/instructor/passages",
    icon: <FileText className="h-5 w-5 text-primary" />,
    title: "Passages",
    desc: "Create and edit reading passages with paragraphs and metadata.",
  },
  {
    href: "/dashboard/instructor/question-sets",
    icon: <List className="h-5 w-5 text-primary" />,
    title: "Question sets",
    desc: "Create question groups (MCQ, TFNG, matching, etc.) for passages.",
  },
  {
    href: "/dashboard/instructor/questions",
    icon: <FileQuestion className="h-5 w-5 text-primary" />,
    title: "Questions",
    desc: "Add individual questions to question sets.",
  },
  {
    href: "/dashboard/instructor/passage-question-sets",
    icon: <Layers className="h-5 w-5 text-primary" />,
    title: "Passage question sets",
    desc: "Link passages + codes + question groups. Creates tests for students.",
  },
];

export default function InstructorDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Instructor dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage reading content. Create passage codes → passages → question sets → questions → passage question sets.
          </p>
        </div>
        <Link href="/profile/reading">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contentLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full p-6 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  {link.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-foreground">{link.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{link.desc}</p>
                  <Button variant="ghost" size="sm" className="mt-3 gap-2">
                    Manage
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-muted bg-muted/20 p-6">
        <h3 className="font-semibold text-foreground">Content creation order</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          1. Passage codes → 2. Passages → 3. Question sets → 4. Questions → 5. Passage question sets.
          Admins can publish content so students can take tests.
        </p>
        <Link href="/profile/reading" className="mt-4 inline-flex">
          <Button variant="outline" size="sm" className="gap-2">
            <BookOpen className="h-4 w-4" />
            View reading summary
          </Button>
        </Link>
      </Card>
    </div>
  );
}
