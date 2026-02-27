import {
  Video,
  FileText,
  Lightbulb,
  BookOpen,
  Clock,
  BarChart2,
  Play,
} from "lucide-react";
import type { LevelStepContentType } from "@/src/lib/api/levels";

export const STEP_ICONS: Record<LevelStepContentType, React.ReactNode> = {
  INTRO: <FileText className="h-4 w-4" />,
  VIDEO: <Video className="h-4 w-4" />,
  NOTE: <FileText className="h-4 w-4" />,
  STRATEGY: <Lightbulb className="h-4 w-4" />,
  PRACTICE_UNTIMED: <BookOpen className="h-4 w-4" />,
  PRACTICE_TIMED: <Clock className="h-4 w-4" />,
  FULL_TEST: <Play className="h-4 w-4" />,
  ANALYTICS: <BarChart2 className="h-4 w-4" />,
};

export const STEP_LABELS: Record<LevelStepContentType, string> = {
  INTRO: "Intro",
  VIDEO: "Video",
  NOTE: "Study note",
  STRATEGY: "Strategy",
  PRACTICE_UNTIMED: "Practice",
  PRACTICE_TIMED: "Timed practice",
  FULL_TEST: "Full test",
  ANALYTICS: "Analytics",
};
