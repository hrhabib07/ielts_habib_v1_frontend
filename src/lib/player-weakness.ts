const STORAGE_KEY = "gamlish-weakness-v1";

export interface WeaknessItem {
  label: string;
  count: number;
  practiceHref: string;
}

function readAll(): WeaknessItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WeaknessItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.label === "string");
  } catch {
    return [];
  }
}

export function listWeaknesses(): WeaknessItem[] {
  return readAll().sort((a, b) => b.count - a.count);
}

export function noteMissedPattern(label: string, practiceHref: string): void {
  const clean = label.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!clean || typeof window === "undefined") return;
  const items = readAll();
  const found = items.find((item) => item.label === clean);
  if (found) {
    found.count += 1;
    found.practiceHref = practiceHref;
  } else {
    items.push({ label: clean, count: 1, practiceHref });
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 12)));
}

export function weaknessLabelForQuestion(input: {
  stageType: string;
  prompt?: string;
  parts?: Array<{ prompt?: string }>;
}): string {
  const blob = [input.prompt, ...(input.parts ?? []).map((part) => part.prompt ?? "")]
    .join(" ")
    .toLowerCase();
  if (blob.includes("number") || blob.includes("person")) return "Number & Person";
  if (blob.includes("am") || blob.includes("is") || blob.includes("are") || blob.includes("be verb")) {
    return "am / is / are";
  }
  if (input.stageType === "translation" || input.stageType === "rearrange") return "Word order";
  return input.prompt?.trim().slice(0, 60) || "This pattern";
}
