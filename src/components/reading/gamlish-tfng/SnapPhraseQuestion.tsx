"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { tokenizeStatement } from "@/src/lib/reading/gamlishTfng/phraseUtils";
import type { GamlishTfngQuestion, TfngAnswer } from "@/src/lib/reading/gamlishTfng/types";
import {
  IeltsCbtSelectableText,
  type IeltsTextHighlight,
  type IeltsTextNote,
} from "./IeltsCbtSelectableText";

const TFNG_OPTIONS: TfngAnswer[] = ["TRUE", "FALSE", "NOT GIVEN"];

interface SnapPhraseQuestionProps {
  question: GamlishTfngQuestion;
  displayNumber: number;
  lastClickedWord: string | null;
  questionFlash: "none" | "miss" | "hit";
  checkingWord: boolean;
  onWordClick: (word: string, wordIndex: number) => void;
  tfngAnswer?: TfngAnswer;
  onTfngChange: (value: TfngAnswer) => void;
  passageUnlocked: boolean;
  isActive: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  statementHighlights: IeltsTextHighlight[];
  statementNotes: IeltsTextNote[];
  onAddStatementHighlight: (highlight: IeltsTextHighlight) => void;
  onAddStatementNote: (note: IeltsTextNote) => void;
  onRemoveStatementHighlights: (highlightIds: string[]) => void;
  onFocus: () => void;
  questionRef?: (el: HTMLDivElement | null) => void;
}

export function SnapPhraseQuestion({
  question,
  displayNumber,
  lastClickedWord,
  questionFlash,
  checkingWord,
  onWordClick,
  tfngAnswer,
  onTfngChange,
  passageUnlocked,
  isActive,
  isBookmarked,
  onToggleBookmark,
  statementHighlights,
  statementNotes,
  onAddStatementHighlight,
  onAddStatementNote,
  onRemoveStatementHighlights,
  onFocus,
  questionRef,
}: SnapPhraseQuestionProps) {
  const tokens = tokenizeStatement(question.questionStatement);
  const showLocatorFlash = !passageUnlocked && questionFlash !== "none";

  return (
    <div
      ref={questionRef}
      id={`tfng-q-${question.id}`}
      className={cn(
        "scroll-mt-3 border-b border-[#e8e8e8] pb-5 pt-1 last:border-b-0",
        showLocatorFlash && questionFlash === "hit" && "bg-[#f6fff8]",
        showLocatorFlash && questionFlash === "miss" && "bg-[#fafafa]",
      )}
      onClick={onFocus}
      role="group"
      aria-label={`Question ${displayNumber}`}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-0.5 flex h-[22px] min-w-[22px] shrink-0 items-center justify-center border-2 px-0.5 text-[10pt] font-semibold leading-none",
            isActive
              ? "border-[#0066b3] text-[#0066b3]"
              : "border-[#0066b3]/65 text-[#0066b3]",
          )}
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          {displayNumber}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
          className={cn(
            "mt-0.5 shrink-0 p-0.5 text-[#888] transition-colors hover:text-[#0066b3]",
            isBookmarked && "text-[#0066b3]",
          )}
        >
          <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-current")} />
        </button>

        <div className="min-w-0 flex-1 leading-[1.55]">
          {passageUnlocked ? (
            <IeltsCbtSelectableText
              text={question.questionStatement}
              enabled
              highlights={statementHighlights}
              notes={statementNotes}
              onAddHighlight={onAddStatementHighlight}
              onAddNote={onAddStatementNote}
              onRemoveHighlights={onRemoveStatementHighlights}
              className="block"
            />
          ) : (
            <p
              className="reading-exam-arial-11 text-black"
              style={{ margin: 0 }}
            >
              {tokens.map((word, wordIndex) => {
                const isLastClicked =
                  lastClickedWord != null &&
                  lastClickedWord.toLowerCase() === word.toLowerCase();

                return (
                  <span key={`${question.id}-w-${wordIndex}`}>
                    {wordIndex > 0 ? " " : ""}
                    <button
                      type="button"
                      disabled={checkingWord}
                      onClick={(e) => {
                        e.stopPropagation();
                        onWordClick(word, wordIndex);
                      }}
                      className={cn(
                        "rounded-sm px-0 text-inherit transition-colors",
                        "hover:bg-[#e8e8e8]",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0066b3]",
                        isLastClicked && questionFlash === "hit" && "bg-[#d4edda]",
                        isLastClicked && questionFlash === "miss" && "bg-[#ececec]",
                      )}
                    >
                      {word}
                    </button>
                  </span>
                );
              })}
            </p>
          )}
        </div>
      </div>

      {!passageUnlocked ? (
        <p
          className="mt-1.5 pl-[30px] text-[9pt] leading-snug text-[#666]"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          Click the locator word to unlock the passage.
        </p>
      ) : (
        <div
          className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 pl-[30px]"
          onClick={(e) => e.stopPropagation()}
          role="radiogroup"
          aria-label={`Answer for question ${displayNumber}`}
        >
          {TFNG_OPTIONS.map((option) => {
            const checked = tfngAnswer === option;
            return (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 reading-exam-arial-11 text-black"
              >
                <input
                  type="radio"
                  name={`tfng-${question.id}`}
                  value={option}
                  checked={checked}
                  onChange={() => onTfngChange(option)}
                  className="h-[14px] w-[14px] shrink-0 border-[#767676] text-[#0066b3] focus:ring-[#0066b3]"
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
