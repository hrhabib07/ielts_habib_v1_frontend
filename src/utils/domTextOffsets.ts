/**
 * Flat text offsets within `root`, consistent with `textContent` order.
 * Works when `root` contains marks, spans, and other inline nodes.
 */
export function getTextOffsetFromRangeStart(
  root: HTMLElement,
  node: Node,
  offset: number,
): number {
  try {
    const r = document.createRange();
    r.setStart(root, 0);
    r.setEnd(node, offset);
    return r.toString().length;
  } catch {
    return -1;
  }
}

export function getSelectionStringOffsetsInRoot(
  root: HTMLElement,
  range: Range,
): { start: number; end: number } | null {
  try {
    if (!root.contains(range.commonAncestorContainer)) return null;
    const start = getTextOffsetFromRangeStart(root, range.startContainer, range.startOffset);
    const end = getTextOffsetFromRangeStart(root, range.endContainer, range.endOffset);
    if (start < 0 || end < 0 || end <= start) return null;
    return { start, end };
  } catch {
    return null;
  }
}
