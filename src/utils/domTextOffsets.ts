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
    let start = getTextOffsetFromRangeStart(root, range.startContainer, range.startOffset);
    let end = getTextOffsetFromRangeStart(root, range.endContainer, range.endOffset);
    if (start < 0 || end < 0) return null;
    if (end < start) [start, end] = [end, start];
    if (end <= start) return null;
    return { start, end };
  } catch {
    return null;
  }
}

function collectTextNodesInRoot(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}

/** Highlights a plain-text offset range inside `root` (matches getSelectionStringOffsetsInRoot). */
export function setSelectionToPlainTextOffsets(
  root: HTMLElement,
  start: number,
  end: number,
): boolean {
  try {
    if (end <= start) return false;
    const nodes = collectTextNodesInRoot(root);
    let cursor = 0;
    let startNode: Text | null = null;
    let startOffset = 0;
    let endNode: Text | null = null;
    let endOffset = 0;

    for (const node of nodes) {
      const len = node.length;
      const nodeStart = cursor;
      const nodeEnd = cursor + len;

      if (!startNode && start < nodeEnd) {
        startNode = node;
        startOffset = Math.max(0, start - nodeStart);
      }
      if (!endNode && end <= nodeEnd) {
        endNode = node;
        endOffset = Math.max(0, end - nodeStart);
        break;
      }
      cursor = nodeEnd;
    }

    if (!startNode || !endNode) return false;

    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  } catch {
    return false;
  }
}
