import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How Gamlish works",
  description:
    "Level-by-level IELTS preparation: follow the system, track progress, and build real band readiness.",
};

export default function HowItWorksPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-6rem)] max-w-3xl px-6 py-12 md:py-16">
      <Button variant="ghost" size="sm" className="mb-8 gap-2" asChild>
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        How Gamlish works
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Gamlish is a performance system for IELTS: you progress through structured levels, clear
        quizzes and checkpoints, and see your target band move from intention to evidence.
      </p>

      <ol className="mt-10 list-decimal space-y-6 pl-6 text-base leading-relaxed text-foreground">
        <li>
          <strong className="font-semibold">Create your account</strong> — set your goal and start
          from where you are.
        </li>
        <li>
          <strong className="font-semibold">Follow the path</strong> — each level builds the skills
          the next one requires; no random drills.
        </li>
        <li>
          <strong className="font-semibold">Prove it</strong> — quizzes, practice tests, and finals
          unlock only when you have shown readiness.
        </li>
        <li>
          <strong className="font-semibold">Track the signal</strong> — your dashboard reflects real
          progress toward your band, not hours watched.
        </li>
      </ol>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/register">Get started</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    </main>
  );
}
