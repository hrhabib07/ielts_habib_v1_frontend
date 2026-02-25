import { BookOpen, Target, Users, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            About IELTS Habib
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We're dedicated to providing focused, high-quality IELTS preparation
            that helps students achieve their goals with clarity and confidence.
          </p>
        </div>

        {/* Mission */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            IELTS Habib was created with a simple goal: to provide students with
            a focused, exam-oriented platform for IELTS preparation. We believe
            that targeted practice, expert guidance, and systematic progress
            tracking are the keys to success.
          </p>
        </section>

        {/* Values */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold">What We Stand For</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Focused Approach</h3>
              <p className="text-sm text-muted-foreground">
                We concentrate on what matters most for IELTS success, starting
                with the Reading module.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Quality Content</h3>
              <p className="text-sm text-muted-foreground">
                Every practice test and exercise is designed around actual IELTS
                requirements.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Expert Guidance</h3>
              <p className="text-sm text-muted-foreground">
                Qualified instructors provide personalized feedback and proven
                strategies.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your improvement and understand your strengths and
                weaknesses.
              </p>
            </div>
          </div>
        </section>

        {/* Phase 1 Focus */}
        <section className="rounded-lg border bg-card p-8 space-y-4">
          <h2 className="text-3xl font-bold">Phase 1: IELTS Reading Module</h2>
          <p className="text-muted-foreground text-lg">
            We're starting with the IELTS Reading module because it's one of the
            most strategic parts of the exam. Our platform will include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Structured practice tests aligned with IELTS format</li>
            <li>Detailed explanations and answer keys</li>
            <li>Progress tracking and performance analytics</li>
            <li>Mock tests that simulate real exam conditions</li>
            <li>Instructor feedback and personalized guidance</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
