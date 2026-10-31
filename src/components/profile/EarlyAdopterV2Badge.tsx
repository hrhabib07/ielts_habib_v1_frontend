import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Permanent badge for learners who bought Gamlish v2 early or paid before v2. */
export function EarlyAdopterV2Badge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-1 font-sans text-xs font-black text-white shadow-sm",
        className,
      )}
      title="Bought Gamlish v2 in the early days"
    >
      <Sparkles className="size-3.5" aria-hidden />
      Early Adopter · Gamlish v2
    </span>
  );
}
