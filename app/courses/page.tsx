import { BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/src/lib/auth-server";
import { getRedirectPathForRole } from "@/src/lib/auth-redirects";

export default async function CoursesPage() {
  const user = await getCurrentUser();
  const ctaHref = user ? getRedirectPathForRole(user.role) : null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            GAMLISH Courses
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The Game of English — comprehensive preparation designed to help you
            achieve your goals.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Courses Coming Soon</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;re building our course content. The Reading module is
              available with practice tests, mock exams, and instructor-guided learning.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {ctaHref ? (
              <Link href={ctaHref}>
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg">Create Account</Button>
              </Link>
            )}
            <Link href="/about">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Course Preview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Reading Module</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Comprehensive preparation with practice tests, strategies, and expert feedback.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Coming Soon</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-4 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Writing Module</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Master Writing with structured practice and detailed feedback.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Planned</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Coming Later
            </Button>
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-4 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">IELTS Listening Module</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Improve your listening skills with targeted practice and
              strategies.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Planned</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Coming Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
