"use client";

import {
  CheckCircle2,
  Lock,
  FileText,
  Video,
  BookOpen,
  Clock,
  Play,
  BarChart2,
  Lightbulb,
} from "lucide-react";
import type { LevelDetailStep } from "@/src/lib/api/readingStrictProgression";

const STEP_TYPE_CONFIG: Record<
  string,
  { label: string; Icon: React.ElementType; color: string }
> = {
  INSTRUCTION: { label: "Instruction", Icon: FileText, color: "text-blue-500" },
  VIDEO: { label: "Video", Icon: Video, color: "text-purple-500" },
  PRACTICE_TEST: { label: "Practice", Icon: BookOpen, color: "text-teal-500" },
  QUIZ: { label: "Quiz", Icon: Play, color: "text-orange-500" },
  VOCABULARY_TEST: {
    label: "Vocabulary",
    Icon: BookOpen,
    color: "text-green-500",
  },
  PASSAGE_QUESTION: {
    label: "Passage",
    Icon: FileText,
    color: "text-indigo-500",
  },
  FINAL_EVALUATION: {
    label: "Final eval",
    Icon: BarChart2,
    color: "text-rose-500",
  },
  NOTE: { label: "Study note", Icon: FileText, color: "text-blue-500" },
  STRATEGY: { label: "Strategy", Icon: Lightbulb, color: "text-amber-500" },
  PRACTICE_UNTIMED: {
    label: "Practice",
    Icon: BookOpen,
    color: "text-teal-500",
  },
  PRACTICE_TIMED: { label: "Timed", Icon: Clock, color: "text-orange-500" },
  FULL_TEST: { label: "Full test", Icon: Play, color: "text-rose-500" },
  ANALYTICS: { label: "Analytics", Icon: BarChart2, color: "text-violet-500" },
  INTRO: { label: "Intro", Icon: FileText, color: "text-blue-500" },
};

function getConfig(stepType: string) {
  return (
    STEP_TYPE_CONFIG[stepType] ?? {
      label: stepType,
      Icon: FileText,
      color: "text-gray-400",
    }
  );
}

export interface LevelSidebarItemProps {
  step: LevelDetailStep;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  onClick: () => void;
}

export function LevelSidebarItem({
  step,
  index,
  isActive,
  isCompleted,
  isLocked,
  onClick,
}: LevelSidebarItemProps) {
  const { label, Icon, color } = getConfig(step.stepType);

  return (
    <button
      type="button"
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={[
        "group relative flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left",
        "transition-all duration-200 ease-in-out",
        isActive
          ? "border-l-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 pl-2.5"
          : isLocked
            ? "cursor-not-allowed opacity-50"
            : "hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700",
      ].join(" ")}
    >
      {/* Step number / status indicator */}
      <div className="relative mt-0.5 shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : isLocked ? (
          <Lock className="h-4 w-4 text-gray-300 dark:text-gray-600 mt-0.5" />
        ) : isActive ? (
          <div className="h-5 w-5 rounded-full border-2 border-indigo-500 bg-indigo-500 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white leading-none">
              {index}
            </span>
          </div>
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center group-hover:border-gray-300 dark:group-hover:border-gray-500 transition-colors duration-200">
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 leading-none">
              {index}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-sm leading-snug font-medium truncate",
            isActive
              ? "text-indigo-700 dark:text-indigo-400"
              : isCompleted
                ? "text-gray-500 dark:text-gray-400"
                : isLocked
                  ? "text-gray-400 dark:text-gray-600"
                  : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100",
          ].join(" ")}
        >
          {step.title}
        </p>
        <div className="mt-0.5 flex items-center gap-1">
          <Icon
            className={`h-3 w-3 shrink-0 ${isActive ? "text-indigo-400" : color} ${isLocked || isCompleted ? "opacity-50" : ""}`}
          />
          <span
            className={`text-xs ${isActive ? "text-indigo-400" : "text-gray-400 dark:text-gray-500"}`}
          >
            {label}
          </span>
          {step.isFinalQuiz && (
            <span className="ml-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0 text-[10px] font-medium text-amber-700 dark:text-amber-400">
              Final
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
