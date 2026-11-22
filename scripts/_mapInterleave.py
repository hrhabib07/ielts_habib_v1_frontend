import re
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "src" / "features"

pairs = [
    ("number", "chat-lesson/content/numberStep.ts", "playground/content/numberPlayground.ts"),
    ("person", "chat-lesson/content/personStep.ts", "playground/content/personPlayground.ts"),
    ("verb", "chat-lesson/content/verbStep.ts", "playground/content/verbPlayground.ts"),
    ("object", "chat-lesson/content/objectStep.ts", "playground/content/objectPlayground.ts"),
    ("wordOrder", "chat-lesson/content/wordOrderStep.ts", "playground/content/wordOrderPlayground.ts"),
]

chunk_re = re.compile(
    r'id:\s*"([^"]+)"\s*,\s*\n\s*title:\s*\{\s*en:\s*"([^"]+)"',
    re.M,
)
round_re = re.compile(
    r'id:\s*"([^"]+)"\s*,\s*\n\s*kind:\s*"([^"]+)"\s*,\s*\n\s*title:\s*\{\s*en:\s*"([^"]+)"',
    re.M,
)

for name, step_rel, play_rel in pairs:
    step = (root / step_rel).read_text(encoding="utf-8")
    play = (root / play_rel).read_text(encoding="utf-8")
    print("===", name, "===")
    # only top-level chunk titles: appear after chunks: and before questions ids often q-
    for cid, title in chunk_re.findall(step):
        if cid.startswith("q-") or cid.startswith("level-"):
            continue
        # filter step ids
        if "step-" in cid or cid.endswith("-step"):
            continue
        print("  chunk", cid, "|", title)
    mid = re.search(r'id:\s*"(level-1-playground-[^"]+)"', play)
    after = re.search(r'afterStepId:\s*"([^"]+)"', play)
    print("  play", mid.group(1) if mid else "?", "after", after.group(1) if after else "?")
    for rid, kind, title in round_re.findall(play):
        print("  round", rid, "|", title, f"({kind})")
