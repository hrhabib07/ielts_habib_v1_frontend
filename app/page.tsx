import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex flex-col">
      {/* HERO SECTION */}
      <section className="flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
          Prepare for IELTS with
          <span className="text-slate-600">
            {" "}
            clarity, strategy, and confidence
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          IELTS Habib is a focused IELTS preparation platform built for students
          who want real progress — starting with the IELTS Reading module.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link href="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Login
            </Button>
          </Link>
        </div>
      </section>

      {/* WHY IELTS HABIB */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Why IELTS Habib?</h2>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Feature
              title="Exam-Oriented Preparation"
              description="Everything is designed around actual IELTS requirements — not generic English practice."
            />
            <Feature
              title="Instructor-Guided Learning"
              description="Qualified instructors guide students with proven strategies and feedback."
            />
            <Feature
              title="Built for Progress"
              description="Track improvement, understand mistakes, and improve systematically."
            />
          </div>
        </div>
      </section>

      {/* PHASE 1 FOCUS */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl font-bold">
            Focused Start: IELTS Reading Module
          </h2>

          <p className="mt-4 text-muted-foreground">
            We start with the most strategic part of IELTS — Reading. Practice
            tests, structured questions, and progress tracking are being built
            step by step.
          </p>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">
            Who Is This Platform For?
          </h2>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <Feature
              title="IELTS Students"
              description="Students preparing for academic or general IELTS who want structured, serious preparation."
            />
            <Feature
              title="IELTS Instructors"
              description="Instructors who want to teach, manage students, and deliver quality guidance."
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold">
          Start Your IELTS Preparation the Right Way
        </h2>
        <p className="mt-4 text-muted-foreground">
          Create an account and begin with focused IELTS Reading practice.
        </p>

        <div className="mt-6">
          <Link href="/register">
            <Button size="lg">Create Free Account</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
