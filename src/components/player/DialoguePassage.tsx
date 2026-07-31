import { cn } from "@/lib/utils";
import { parseDialoguePassage, type DialogueTurn } from "@/src/lib/dialogue-passage";

const SPEAKER_STYLES = [
  {
    side: "left" as const,
    bubble: "rounded-2xl rounded-tl-md border border-border/70 bg-background text-foreground",
    avatar: "bg-slate-600 text-white dark:bg-slate-500",
    name: "text-slate-600 dark:text-slate-300",
  },
  {
    side: "right" as const,
    bubble:
      "rounded-2xl rounded-tr-md border border-sky-500/25 bg-sky-500/10 text-foreground dark:border-sky-400/30 dark:bg-sky-400/15",
    avatar: "bg-sky-600 text-white dark:bg-sky-500",
    name: "text-sky-700 dark:text-sky-300",
  },
] as const;

function speakerIndexMap(turns: DialogueTurn[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const turn of turns) {
    if (!map.has(turn.speaker)) {
      map.set(turn.speaker, map.size);
    }
  }
  return map;
}

function DialogueBubbles({ turns }: { turns: DialogueTurn[] }) {
  const indices = speakerIndexMap(turns);

  return (
    <div className="space-y-3.5" role="list" aria-label="Dialogue">
      {turns.map((turn, i) => {
        const speakerIdx = indices.get(turn.speaker) ?? 0;
        const style = SPEAKER_STYLES[speakerIdx % SPEAKER_STYLES.length] ?? SPEAKER_STYLES[0];
        const isRight = style.side === "right";
        const initial = turn.speaker.charAt(0).toUpperCase();

        return (
          <div
            key={`${turn.speaker}-${i}`}
            role="listitem"
            className={cn(
              "flex gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-300",
              isRight ? "flex-row-reverse" : "flex-row",
            )}
          >
            <div
              className={cn(
                "mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                style.avatar,
              )}
              aria-hidden
            >
              {initial}
            </div>
            <div className={cn("min-w-0 max-w-[85%] space-y-1", isRight && "items-end")}>
              <p
                className={cn(
                  "px-1 text-[11px] font-semibold tracking-wide",
                  style.name,
                  isRight && "text-right",
                )}
              >
                {turn.speaker}
              </p>
              <div className={cn("px-3.5 py-2.5 text-[15px] leading-relaxed", style.bubble)}>
                {turn.text}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PassageContent({
  passage,
  className,
}: {
  passage: string;
  className?: string;
}) {
  const turns = parseDialoguePassage(passage);

  if (turns) {
    return (
      <div className={cn("rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5", className)}>
        <DialogueBubbles turns={turns} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-muted/30 p-5 text-[15px] leading-relaxed whitespace-pre-wrap text-foreground",
        className,
      )}
    >
      {passage}
    </div>
  );
}
