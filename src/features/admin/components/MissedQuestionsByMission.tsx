import Link from "next/link";
import type { MissedMission } from "@/src/lib/api/weeklyDecision";
import { Card } from "@/components/ui/card";

function missTotal(question: MissedMission["questions"][number]): number {
  return question.rejectedChecks + question.wrongStudents + question.leftStudents;
}

export function MissedQuestionsByMission({
  missions,
  empty,
}: {
  missions: readonly MissedMission[];
  empty?: string;
}) {
  if (missions.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        {empty ??
          "No missed questions in the last 14 days. When students miss the same question, it will show here by mission."}
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {missions.map((mission) => (
        <Card key={mission.missionSlug} className="p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Link
              href={`/dashboard/admin/english/missions/${mission.missionSlug}`}
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              {mission.missionSlug}
            </Link>
            <p className="text-xs text-muted-foreground">{mission.misses} misses</p>
          </div>
          <ul className="mt-3 space-y-3">
            {mission.questions.map((question) => (
              <li key={question.questionId} className="text-sm">
                <p className="font-medium text-foreground">{question.questionId}</p>
                {question.prompt ? (
                  <p className="mt-0.5 text-muted-foreground">{question.prompt}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {question.rejectedChecks} typed answers rejected
                  {" · "}
                  {question.wrongStudents} students marked wrong
                  {" · "}
                  {question.leftStudents} left this question
                  {" · "}
                  {missTotal(question)} total
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
