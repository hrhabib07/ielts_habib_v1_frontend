import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, TrendingUp, ArrowRight } from "lucide-react";
import { HomeHero } from "@/src/components/home/HomeHero";

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <HomeHero>
        {/* When logged in with band set, only the hero shows; these sections show only when not logged in / no band */}
        {/* WHY IELTS HABIB — students only */}
      <section className="border-t bg-muted/40 py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why IELTS Habib?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A focused IELTS preparation platform for students
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Feature
              icon={<Target className="h-6 w-6" />}
              title="Exam-Oriented Preparation"
              description="Everything is designed around actual IELTS requirements — not generic English practice."
            />
            <Feature
              icon={<BookOpen className="h-6 w-6" />}
              title="Structured Learning"
              description="Our team manages content and guides you with proven strategies and feedback."
            />
            <Feature
              icon={<TrendingUp className="h-6 w-6" />}
              title="Built for Progress"
              description="Track improvement, understand mistakes, and improve systematically."
            />
          </div>
        </div>
      </section>

      {/* FOCUS: READING */}
      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="rounded-lg border bg-card p-12 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Focused Start: IELTS Reading Module
            </h2>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              We start with the most strategic part of IELTS — Reading. Practice
              tests, structured questions, and progress tracking are built step by step.
            </p>
          </div>
        </div>
      </section>

      {/* FOR STUDENTS ONLY */}
      <section className="border-t bg-muted/40 py-20">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            For IELTS Students
          </h2>
          <p className="text-lg text-muted-foreground">
            This platform is for students preparing for academic or general IELTS
            who want structured, serious preparation. Our team manages the website
            and content for you.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 text-center">
        <div className="container mx-auto max-w-3xl px-6 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Start Your IELTS Preparation the Right Way
          </h2>
          <p className="text-lg text-muted-foreground">
            Create an account and begin with focused IELTS Reading practice.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </HomeHero>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center space-y-4 hover:shadow-md transition-shadow">
      <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
