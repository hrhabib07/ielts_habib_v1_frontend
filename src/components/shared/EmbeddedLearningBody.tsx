"use client";

const SCOPE_CLASS = "gamlish-embedded-scope";

function isFullHtmlDocument(html: string): boolean {
  const t = html.trim();
  return /^<!DOCTYPE/i.test(t) || /^<html[\s>]/i.test(t);
}

function scopeBodyHtmlInCss(css: string): string {
  let next = css;
  next = next.replace(/\bbody\s*\{/gi, `.${SCOPE_CLASS} {`);
  next = next.replace(/\bhtml\s*\{/gi, `.${SCOPE_CLASS} {`);
  next = next.replace(
    /\b(body|html)\s*,\s*(body|html)\s*\{/gi,
    `.${SCOPE_CLASS} {`,
  );
  return next;
}

/**
 * Full HTML documents from instructors: extract head styles/links + body markup,
 * scope `body`/`html` CSS to a wrapper so it never hits the app shell, and render
 * as one fragment so the note scrolls with the main layout (no tiny iframe).
 */
function fullDocumentToScopedFragment(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script").forEach((el) => el.remove());

  const styles: string[] = [];
  doc.querySelectorAll("style").forEach((el) => {
    styles.push(scopeBodyHtmlInCss(el.textContent ?? ""));
    el.remove();
  });

  const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(
    (el) => el.outerHTML,
  );

  const bodyHtml = doc.body?.innerHTML ?? "";
  return `${links.join("")}<style>${styles.join("\n")}</style><div class="${SCOPE_CLASS}">${bodyHtml}</div>`;
}

/**
 * Inline `<style>` blocks in pasted fragments often target `body` / `html`. Those
 * selectors apply to the real document when HTML is injected, breaking the app shell.
 * Scope those rules to a wrapper class and wrap the fragment when needed.
 */
function scopeFragmentStyles(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return trimmed;

  const hasStyle = /<style[\s>]/i.test(trimmed);
  if (!hasStyle) return trimmed;

  const processed = trimmed.replace(
    /<style([^>]*)>([\s\S]*?)<\/style>/gi,
    (_full, attrs: string, css: string) => {
      const scoped = scopeBodyHtmlInCss(css);
      return `<style${attrs}>${scoped}</style>`;
    },
  );

  return `<div class="${SCOPE_CLASS}">${processed}</div>`;
}

function normalizeLearningHtml(html: string): string {
  if (isFullHtmlDocument(html)) {
    return fullDocumentToScopedFragment(html);
  }
  return scopeFragmentStyles(html);
}

export interface EmbeddedLearningBodyProps {
  html: string;
  /** Accessible label for the rendered note region. */
  title: string;
  className?: string;
}

/**
 * Renders instructor-authored HTML without letting embedded `body` / `html` CSS
 * leak onto the app layout. Full documents are parsed and scoped (no iframe) so
 * notes use the page scroll and get a full, readable height.
 */
export function EmbeddedLearningBody({ html, title, className }: EmbeddedLearningBodyProps) {
  if (!html.trim()) return null;

  const processed = normalizeLearningHtml(html);
  return (
    <div
      role="article"
      aria-label={title}
      className={className}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}
