"use client";

/**
 * Renders IELTS-style instruction text matching official British Council / IDP exam format:
 * - TRUE/FALSE/NOT GIVEN (and YES/NO/NOT GIVEN) as uniform light grey blocks with bold labels
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
    const rawDefinitionLines = writeIndex >= 0 ? lines.slice(writeIndex + 1) : [];

    const DEFINITIONS = isTFNG
      ? [
          { label: "TRUE", desc: "if the statement agrees with the information" },
          { label: "FALSE", desc: "if the statement contradicts the information" },
          { label: "NOT GIVEN", desc: "if there is no information on this" },
        ]
      : [
          { label: "YES", desc: "if the statement agrees with the views of the writer" },
          { label: "NO", desc: "if the statement contradicts the views of the writer" },
          { label: "NOT GIVEN", desc: "if it is impossible to say what the writer thinks about this" },
        ];

    const parsedDefinitions = rawDefinitionLines
      .map((line) => {
        const m = line.match(/^(TRUE|FALSE|NOT GIVEN|YES|NO)\.?\s*(.*)$/i);
        if (m) return { label: m[1].toUpperCase(), desc: (m[2] || line).trim() };
        return null;
      })
      .filter(Boolean) as { label: string; desc: string }[];

    const definitions = parsedDefinitions.length >= 3 ? parsedDefinitions : DEFINITIONS;

    const isQuestionsHeading = (s: string) =>
      /^Questions\s+\d+-\d+$/i.test(s.trim());

    return (
      <div className="space-y-3 text-sm font-sans text-slate-800 dark:text-slate-200">
        {mainLines.map((line, i) => (
          <p key={i} className={isQuestionsHeading(line) ? "font-bold text-slate-900 dark:text-slate-100" : "italic"}>
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
        <div className="mt-3 space-y-1">
          {definitions.map((def, i) => (
            <div
              key={i}
              className="flex flex-wrap gap-x-2 gap-y-0.5 bg-[#f5f5f5] dark:bg-slate-700/50 px-4 py-2.5"
            >
              <span className="shrink-0 font-bold text-slate-900 dark:text-slate-100">
                {def.label}
              </span>
              <span className="text-slate-700 dark:text-slate-300">{def.desc}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const completionTypes = [
    "SENTENCE_COMPLETION",
    "SUMMARY_COMPLETION",
    "SUMMARY_COMPLETION_WITH_CLUES",
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
