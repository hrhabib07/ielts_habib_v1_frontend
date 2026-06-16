"use client";

import type { RefObject } from "react";
import { Highlighter, Quote } from "lucide-react";

interface IeltsCbtSelectionMenuProps {
  x: number;
  y: number;
  onNote: () => void;
  onHighlight: () => void;
  onClearHighlight?: () => void;
  showClearHighlight?: boolean;
  menuRef?: RefObject<HTMLDivElement | null>;
}

export function IeltsCbtSelectionMenu({
  x,
  y,
  onNote,
  onHighlight,
  onClearHighlight,
  showClearHighlight,
  menuRef,
}: IeltsCbtSelectionMenuProps) {
  const left =
    typeof window !== "undefined"
      ? Math.min(Math.max(x, 56), window.innerWidth - 56)
      : x;

  return (
    <div
      ref={menuRef}
      className="fixed z-[250] -translate-x-1/2"
      style={{ left, top: y }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="relative flex flex-col overflow-hidden rounded-sm border border-[#c8c8c8] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        <div className="pointer-events-none absolute -top-[7px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-b-[7px] border-x-transparent border-b-[#c8c8c8]" />
        <div className="pointer-events-none absolute -top-[6px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-b-[6px] border-x-transparent border-b-white" />

        <button
          type="button"
          onClick={onNote}
          className="flex min-w-[72px] flex-col items-center gap-1 border-b border-[#e5e5e5] px-4 py-2.5 text-[#333] transition-colors hover:bg-[#f5f5f5]"
        >
          <Quote className="h-4 w-4 text-[#555]" strokeWidth={2.5} />
          <span className="text-[11px] font-normal leading-none">Note</span>
        </button>

        <button
          type="button"
          onClick={onHighlight}
          className="flex min-w-[72px] flex-col items-center gap-1 px-4 py-2.5 text-[#333] transition-colors hover:bg-[#f5f5f5]"
        >
          <Highlighter className="h-4 w-4 text-[#555]" strokeWidth={2.5} />
          <span className="text-[11px] font-normal leading-none">Highlight</span>
        </button>

        {showClearHighlight && onClearHighlight ? (
          <button
            type="button"
            onClick={onClearHighlight}
            className="flex min-w-[72px] flex-col items-center gap-1 border-t border-[#e5e5e5] px-4 py-2.5 text-[#333] transition-colors hover:bg-[#f5f5f5]"
          >
            <span className="text-[10px] font-normal leading-none">Clear</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
