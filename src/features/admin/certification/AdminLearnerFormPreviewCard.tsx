"use client";

import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CERTIFICATION_STORY_QUESTIONS } from "@/src/lib/certification-story-copy";

export function AdminLearnerFormPreviewCard() {
  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-start gap-2">
        <FileText className="mt-0.5 h-5 w-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Learner story form (how students see it)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Students answer one question at a time. Same five fields as before. No character
            minimum or maximum. They can skip a question. Real applications below show their
            answers in this same order.
          </p>
        </div>
      </div>
      <ol className="space-y-3">
        {CERTIFICATION_STORY_QUESTIONS.map((field, index) => (
          <li key={field.id} className="space-y-1 rounded-xl border bg-muted/20 p-4">
            <p className="text-xs font-semibold text-primary">
              Story {index + 1} of {CERTIFICATION_STORY_QUESTIONS.length}
            </p>
            <p className="text-sm font-semibold">{field.questionBn}</p>
            <p className="text-xs text-muted-foreground">{field.questionEn}</p>
            <p className="text-sm text-muted-foreground">{field.placeholder}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
