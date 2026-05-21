/**
 * Copy-paste into Gemini (or ChatGPT) with your English + Bangla raw notes below the line.
 * Output must be pasted into Gamlish → Validate → Apply → Save lesson.
 */
export const GEMINI_LESSON_GENERATION_PROMPT = `You are a JSON generator for the Gamlish IELTS Reading platform.

TASK: Convert the ENGLISH NOTE and BANGLA NOTE below into ONE valid JSON object.

OUTPUT RULES (strict):
1. Output ONLY raw JSON. No markdown. No \`\`\` fences. No explanation before or after.
2. Use this exact structure: lessonTitle + blocks array.
3. Block types: "note" and "microQuiz" only.
4. Alternate: note → microQuiz → note → microQuiz (after each teaching section).
5. Every user-facing string must be an object: { "en": "...", "bn": "..." }.
6. Micro-quiz: each question has question, A, B, C, D, correct, explanation — all with en and bn.
7. correct must be ONLY the letter: "A", "B", "C", or "D" (match the English answer key).
8. CRITICAL JSON RULE: Inside any string value, do NOT use unescaped double quotes.
   - WRONG: "content": "This is an "open book" test."
   - RIGHT: "content": "This is an 'open book' test."
   - RIGHT: "content": "This is an \\"open book\\" test."
   Use single quotes (') for quoted phrases inside sentences whenever possible.

NOTE BLOCKS — HARD VALIDATION (Gamlish will reject the whole paste if any note breaks this):
• This applies to every block with "type": "note" that uses separate "en" and "bn" objects (not the rare "body": { "en", "bn" } shortcut).
• For each such note, AT LEAST ONE of the following must be true across en and bn combined:
  (a) trimmed "content" is non-empty in English OR Bangla, OR
  (b) "metaRows" is a non-empty array in English OR Bangla, OR
  (c) "bullets" is a non-empty array in English OR Bangla.
• These fields NEVER satisfy that rule by themselves: "levelLabel", "instructorNote", "heading" only.
  Putting the entire INTRO welcome only inside "instructorNote" with "content": "" in BOTH languages WILL FAIL with:
  "add content, metaRows, or bullets in at least one language."
• Correct INTRO pattern: put the main student-facing welcome and teaching prose in "content" (both en and bn, with \\n\\n between paragraphs). Use "instructorNote" only as an optional extra line labeled in the UI — never as the sole carrier of the lesson text.
• MODULE_META: "content" may be "" in both languages if "metaRows" has rows in at least one language (ideally both).

SECTION tags for "note" blocks (use exactly one per note):
INTRO | MODULE_META | CORE_OBJECTIVE | MECHANICS | PARAPHRASE | EXECUTION | MINEFIELD | ARSENAL | WRAP_UP

Note block shape:
{
  "type": "note",
  "section": "INTRO",
  "en": {
    "levelLabel": "only on INTRO — optional",
    "instructorNote": "optional short aside; NOT a substitute for content",
    "heading": "optional",
    "content": "REQUIRED unless metaRows or bullets carry the block — paragraphs separated by \\n\\n",
    "bullets": ["optional", "array"],
    "metaRows": [{ "label": "Target Level", "value": "Level 0" }]
  },
  "bn": { same keys, Bangla text }
}

MODULE_META: usually content "" and metaRows filled in both languages.

Micro-quiz shape:
{
  "type": "microQuiz",
  "title": { "en": "Micro Quiz", "bn": "Micro Quiz" },
  "questions": [
    {
      "question": { "en": "...", "bn": "..." },
      "A": { "en": "...", "bn": "..." },
      "B": { "en": "...", "bn": "..." },
      "C": { "en": "...", "bn": "..." },
      "D": { "en": "...", "bn": "..." },
      "correct": "B",
      "explanation": { "en": "...", "bn": "..." }
    }
  ]
}

lessonTitle example: "Level 0 — The Mastery Foundation"

--- ENGLISH NOTE (source) ---
[PASTE ENGLISH NOTE HERE]

--- BANGLA NOTE (source) ---
[PASTE BANGLA NOTE HERE]

Generate the complete JSON now.`;

export const JSON_PASTE_CHECKLIST = [
  "Copy Gemini prompt → add your EN + BN notes at the bottom → generate JSON only (no markdown)",
  "Paste JSON below → Validate → Apply to lesson → Save lesson",
  'If Validate says "add content, metaRows, or bullets": every note needs non-empty content OR metaRows OR bullets (en or bn); instructorNote alone is not enough',
  "If Validate fails on JSON: replace inner \" with ' (e.g. 'Open Book Exam', 'Aha!') or use Load perfect Level 0 as reference",
];
