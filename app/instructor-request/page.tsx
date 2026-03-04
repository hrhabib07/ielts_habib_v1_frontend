"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { InstructorRequestCard } from "@/src/features/instructor-request/components/InstructorRequestCard";
import { getDecodedTokenClient } from "@/src/lib/auth";
import { GraduationCap } from "lucide-react";

export default function InstructorRequestPage() {
  const router = useRouter();

  useEffect(() => {
    const decoded = getDecodedTokenClient();
    if (!decoded) {
      router.replace("/login");
      return;
    }
    if (decoded.role !== "STUDENT") {
      router.replace("/");
      return;
    }
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Become an Instructor</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your expertise and help students excel. Apply to become an instructor on GAMLISH.
          </p>
        </div>

        <div className="flex justify-center">
          <InstructorRequestCard />
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">What does being an instructor mean?</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Guide students through structured Reading practice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Provide feedback and personalized learning strategies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Help students track their progress and improve systematically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Contribute to building a quality IELTS preparation platform</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
