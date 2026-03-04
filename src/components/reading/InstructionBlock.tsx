"use client";

/**
 * Renders IELTS-style instruction text with professional formatting:
 * - TRUE/FALSE/NOT GIVEN (and YES/NO/NOT GIVEN) as alternating rows with bold labels
 * - "NO MORE THAN X WORDS" highlighted in bold red for completion types
 * - "In boxes X - Y" with bold numbers
 * - Main instruction in italic
 */
export function InstructionBlock({
  instruction,
  questionType,
}: {
  instruction: string;
  questionType: string;
}) {
  const isTFNG = questionType === "TRUE_FALSE_NOT_GIVEN";
  const isYNNG = questionType === "YES_NO_NOT_GIVEN";
  const isAgreeType = isTFNG || isYNNG;

  const completionWordLimitRegex =
    /(NO MORE THAN (?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN) WORDS)/gi;

  if (isAgreeType) {
    const lines = instruction.split("\n").map((l) => l.trim()).filter(Boolean);
    const writeIndex = lines.findIndex((l) => l.toLowerCase().startsWith("in boxes"));
    const mainLines = writeIndex >= 0 ? lines.slice(0, writeIndex) : lines;
    const inBoxesLine = writeIndex >= 0 ? lines[writeIndex] : null;
    const definitionLines = writeIndex >= 0 ? lines.slice(writeIndex + 1) : [];

    return (
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
        {mainLines.map((line, i) => (
          <p key={i} className="italic">
            {line}
          </p>
        ))}
        {inBoxesLine && (
          <p className="italic">
            {inBoxesLine.split(/(\d+\s*-\s*\d+)/).map((part, i) =>
              /^\d+\s*-\s*\d+$/.test(part.trim()) ? (
                <strong key={i} className="font-bold text-slate-900 dark:text-slate-100">
                  {part.trim()}
                </strong>
              ) : (
                part
              ),
            )}
          </p>
        )}
        {definitionLines.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            {definitionLines.map((line, i) => {
              const match = line.match(/^(TRUE|FALSE|NOT GIVEN|YES|NO)\.\s*(.*)$/i);
              const label = match ? match[1].toUpperCase() + "." : "";
              const rest = match ? match[2] : line;
              const bg =
                i % 2 === 0
                  ? "bg-slate-100 dark:bg-slate-800/60"
                  : "bg-white dark:bg-slate-900/40";
              return (
                <div
                  key={i}
                  className={`flex gap-2 px-4 py-2.5 ${bg} border-b border-slate-200/80 dark:border-slate-700/80 last:border-b-0`}
                >
                  <span className="shrink-0 font-bold text-slate-900 dark:text-slate-100">
                    {label}
                  </span>
                  <span>{rest}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const completionTypes = [
    "SENTENCE_COMPLETION",
    "SUMMARY_COMPLETION",
    "NOTE_COMPLETION",
    "TABLE_COMPLETION",
    "FLOW_CHART_COMPLETION",
    "DIAGRAM_LABEL_COMPLETION",
    "SHORT_ANSWER",
  ];
  const isCompletion = completionTypes.includes(questionType);

  if (isCompletion) {
    const highlightPart = (text: string) => {
      const segments: React.ReactNode[] = [];
      let lastIndex = 0;
      let segmentKey = 0;
      const re = new RegExp(completionWordLimitRegex.source, "gi");
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        segments.push(text.slice(lastIndex, m.index));
        segments.push(
          <span
            key={segmentKey++}
            className="font-bold uppercase text-red-600 dark:text-red-400"
          >
            {m[1]}
          </span>,
        );
        lastIndex = m.index + m[0].length;
      }
      segments.push(text.slice(lastIndex));
      return segments;
    };

    const paragraphs = instruction.split(/\n\n+/).filter(Boolean);
    return (
      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
        {paragraphs.map((para, i) => (
          <p key={i} className="italic">
            {highlightPart(para)}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
      {instruction}
    </div>
  );
}
