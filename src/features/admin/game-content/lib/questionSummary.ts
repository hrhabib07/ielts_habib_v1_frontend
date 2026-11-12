import type { PlayItem } from "@/src/features/playground/types";

const PERSON: Record<string, string> = { first: "First Person", second: "Second Person", third: "Third Person" };
const NUMBER: Record<string, string> = { singular: "Singular", plural: "Plural" };
const DIAGNOSIS: Record<string, string> = {
  order: "Wrong order",
  verb: "Missing Verb",
  form: "Wrong word form",
  extra: "Extra word",
};

const at = (list: readonly string[], i: number | null | undefined) => (i === null || i === undefined ? "" : (list[i] ?? "?"));

/** One-line view of a question for the editor list: what the learner sees, and the answer in words. */
export function questionSummary(play: PlayItem): { sees: string; answer: string } {
  switch (play.kind) {
    case "ask-first": {
      const it = play.item;
      return { sees: it.words.join(" "), answer: `${it.kind === "who" ? "Who" : "What"} → ${at(it.words, it.subject)}` };
    }
    case "stretch":
      return { sees: play.item.words.join(" "), answer: play.item.words.slice(0, play.item.subjectEnd + 1).join(" ") };
    case "hidden-you":
      return {
        sees: `${play.item.speakerLabel.en}: ${play.item.words.join(" ")}`,
        answer: play.item.subject === undefined ? "Hidden You" : at(play.item.words, play.item.subject),
      };
    case "talk":
      return { sees: play.item.question.en, answer: `Any ${play.item.accepts}` };
    case "count-build":
      return { sees: `${play.item.emoji} × ${play.item.count}`, answer: `${play.item.numberWord} ${play.item.answer}` };
    case "plural-machine":
      return { sees: play.item.word, answer: play.item.answer };
    case "bangla-trap":
      return { sees: play.item.words.join(" "), answer: `${at(play.item.words, play.item.wrong)} → ${play.item.fix}` };
    case "bazar-list":
      return { sees: `${play.item.before} ___ (${play.item.clue})`, answer: play.item.answer };
    case "group-chat":
      return { sees: play.item.words.join(" "), answer: `${at(play.item.words, play.item.focus)} = ${PERSON[play.item.answer] ?? ""}` };
    case "name-swap":
      return { sees: play.item.words.join(" "), answer: `${at(play.item.words, play.item.focus)} → ${play.item.answer}` };
    case "respect-trap":
      return { sees: play.item.bangla, answer: play.item.answer };
    case "team-up":
      return { sees: play.item.members.join(" + "), answer: `${PERSON[play.item.person] ?? ""} → ${play.item.pronoun}` };
    case "six-box":
      return { sees: play.item.card, answer: `${NUMBER[play.item.number] ?? ""} · ${PERSON[play.item.person] ?? ""}` };
    case "code-lock":
      return {
        sees: play.item.words.join(" "),
        answer: `${play.item.subject.map((i) => at(play.item.words, i)).join(" ")} · ${NUMBER[play.item.number] ?? ""} · ${PERSON[play.item.person] ?? ""}`,
      };
    case "odd-one-out":
      return { sees: play.item.cards.join(" / "), answer: at(play.item.cards, play.item.odd) };
    case "build-order":
      return { sees: `${NUMBER[play.item.number] ?? ""} · ${PERSON[play.item.person] ?? ""}`, answer: play.item.accepted[0] ?? "" };
    case "verb-spotlight":
      return { sees: play.item.words.join(" "), answer: at(play.item.words, play.item.verb) };
    case "fix-bridge":
      return { sees: `${play.item.before} ___ ${play.item.after}`, answer: play.item.answer };
    case "bin-extra":
      return {
        sees: play.item.words.join(" "),
        answer: play.item.extra === null ? "Looks correct" : `Bin "${at(play.item.words, play.item.extra)}"`,
      };
    case "action-camera":
      return { sees: `${play.item.emoji} ${play.item.before} ___ ${play.item.after}`, answer: play.item.answer };
    case "pass-ball":
      return {
        sees: play.item.words.join(" "),
        answer: play.item.object === null ? "No Object" : `${play.item.ask === "whom" ? "Whom" : "What"} → ${at(play.item.words, play.item.object)}`,
      };
    case "object-place":
      return { sees: play.item.words.join(" "), answer: `${at(play.item.words, play.item.focus)} = ${play.item.answer}` };
    case "mirror-words":
      return { sees: `${play.item.before} ___ ${play.item.after}`, answer: play.item.answer };
    case "complete-or-not":
      return { sees: `${play.item.start} ...`, answer: play.item.complete ? "Complete" : `Needs: ${play.item.answer ?? ""}` };
    case "bangla-flip":
      return { sees: play.item.bangla, answer: `${play.item.subject} ${play.item.verb} ${play.item.object}` };
    case "grow-sentence":
      return { sees: play.item.bangla, answer: `${play.item.base} ${play.item.place} ${play.item.time}` };
    case "sentence-doctor":
      return { sees: play.item.sick, answer: `${DIAGNOSIS[play.item.diagnosis] ?? ""} → ${play.item.cure}` };
    case "my-diary":
      return { sees: play.item.bangla, answer: play.item.accepted[0] ?? "" };
  }
}
