"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { IntegratedLessonBlock } from "@/src/lib/api/adminReadingVersions";
import type { LessonLocale } from "@/src/lib/localizedText";
import { normalizeLocalizedText, pickLocalizedText } from "@/src/lib/localizedText";
import {
  compileNoteSectionHtml,
  type NoteSectionFields,
} from "./integratedLessonNoteCompiler";
import {
  getNoteSectionTemplate,
  NOTE_SECTION_TEMPLATES,
  type NoteSectionKind,
} from "./integratedLessonTemplates";
import { EmbeddedLearningBody } from "@/src/components/shared/EmbeddedLearningBody";

interface NoteBlockEditorProps {
  block: IntegratedLessonBlock;
  editLocale: LessonLocale;
  disabled?: boolean;
  onChange: (patch: Partial<IntegratedLessonBlock>) => void;
}

function defaultFields(kind: NoteSectionKind): { en: NoteSectionFields; bn: NoteSectionFields } {
  const template = getNoteSectionTemplate(kind);
  if (template) return { en: { ...template.en }, bn: { ...template.bn } };
  return {
    en: { sectionKind: kind, content: "" },
    bn: { sectionKind: kind, content: "" },
  };
}

function pushBody(
  enFields: NoteSectionFields,
  bnFields: NoteSectionFields,
  onChange: (patch: Partial<IntegratedLessonBlock>) => void,
) {
  onChange({
    body: {
      en: compileNoteSectionHtml(enFields),
      bn: compileNoteSectionHtml(bnFields),
    },
    sectionKind: enFields.sectionKind,
  });
}

export function NoteBlockEditor({
  block,
  editLocale,
  disabled,
  onChange,
}: NoteBlockEditorProps) {
  const kind = (block.sectionKind as NoteSectionKind) || "CUSTOM";
  const [enFields, setEnFields] = useState<NoteSectionFields>(() => defaultFields(kind).en);
  const [bnFields, setBnFields] = useState<NoteSectionFields>(() => defaultFields(kind).bn);
  const [showHtml, setShowHtml] = useState(false);
  const [htmlBody, setHtmlBody] = useState(() => normalizeLocalizedText(block.body));

  const activeFields = editLocale === "bn" ? bnFields : enFields;

  const updateEn = (next: NoteSectionFields) => {
    setEnFields(next);
    pushBody(next, bnFields, onChange);
  };

  const updateBn = (next: NoteSectionFields) => {
    setBnFields(next);
    pushBody(enFields, next, onChange);
  };

  const setActiveFields = (next: NoteSectionFields) => {
    if (editLocale === "bn") updateBn(next);
    else updateEn(next);
  };

  const previewHtml = useMemo(
    () =>
      pickLocalizedText(
        {
          en: compileNoteSectionHtml(enFields),
          bn: compileNoteSectionHtml(bnFields),
        },
        editLocale,
      ),
    [enFields, bnFields, editLocale],
  );

  const applySectionTemplate = (nextKind: NoteSectionKind) => {
    const { en, bn } = defaultFields(nextKind);
    setEnFields(en);
    setBnFields(bn);
    pushBody(en, bn, onChange);
    onChange({ sectionKind: nextKind });
  };

  const metaRows = activeFields.metaRows ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[220px] flex-1">
          <Label className="text-xs">Section template</Label>
          <select
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
            value={kind}
            disabled={disabled}
            onChange={(e) => applySectionTemplate(e.target.value as NoteSectionKind)}
          >
            {NOTE_SECTION_TEMPLATES.map((t) => (
              <option key={t.kind} value={t.kind}>
                {t.label}
              </option>
            ))}
            <option value="CUSTOM">Custom section</option>
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {getNoteSectionTemplate(kind)?.description ?? "Free-form note section."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => applySectionTemplate(kind)}
        >
          Reset template text
        </Button>
      </div>

      {kind === "INTRO" && (
        <Input
          value={activeFields.levelLabel ?? ""}
          disabled={disabled}
          placeholder="Gamlish Level Note: Level 0 - …"
          className={editLocale === "bn" ? "font-bengali" : undefined}
          onChange={(e) =>
            setActiveFields({ ...activeFields, levelLabel: e.target.value })
          }
        />
      )}

      <div>
        <Label className="text-xs">Instructor note (optional)</Label>
        <Textarea
          value={activeFields.instructorNote ?? ""}
          disabled={disabled}
          rows={3}
          className={editLocale === "bn" ? "font-bengali mt-1" : "mt-1"}
          onChange={(e) =>
            setActiveFields({ ...activeFields, instructorNote: e.target.value })
          }
        />
      </div>

      <div>
        <Label className="text-xs">Section heading</Label>
        <Input
          value={activeFields.heading ?? ""}
          disabled={disabled}
          className={editLocale === "bn" ? "font-bengali mt-1" : "mt-1"}
          onChange={(e) => setActiveFields({ ...activeFields, heading: e.target.value })}
        />
      </div>

      <div>
        <Label className="text-xs">Main content</Label>
        <Textarea
          value={activeFields.content}
          disabled={disabled}
          rows={6}
          className={editLocale === "bn" ? "font-bengali mt-1" : "mt-1"}
          onChange={(e) => setActiveFields({ ...activeFields, content: e.target.value })}
        />
      </div>

      {(kind === "MODULE_META" || metaRows.length > 0) && (
        <div className="space-y-2 rounded-md border border-dashed border-border p-3">
          <Label className="text-xs">Meta rows (label → value)</Label>
          {metaRows.map((row, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <Input
                value={row.label}
                disabled={disabled}
                placeholder="Label"
                onChange={(e) => {
                  const rows = [...metaRows];
                  const prev = rows[i] ?? { label: "", value: "" };
                  rows[i] = { ...prev, label: e.target.value };
                  setActiveFields({ ...activeFields, metaRows: rows });
                }}
              />
              <Input
                value={row.value}
                disabled={disabled}
                placeholder="Value"
                className={editLocale === "bn" ? "font-bengali" : undefined}
                onChange={(e) => {
                  const rows = [...metaRows];
                  const prev = rows[i] ?? { label: "", value: "" };
                  rows[i] = { ...prev, value: e.target.value };
                  setActiveFields({ ...activeFields, metaRows: rows });
                }}
              />
            </div>
          ))}
          {!disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setActiveFields({
                  ...activeFields,
                  metaRows: [...metaRows, { label: "", value: "" }],
                })
              }
            >
              Add meta row
            </Button>
          )}
        </div>
      )}

      <div>
        <Label className="text-xs">Bullet points (one per line)</Label>
        <Textarea
          value={(activeFields.bullets ?? []).join("\n")}
          disabled={disabled}
          rows={4}
          className={editLocale === "bn" ? "font-bengali mt-1" : "mt-1"}
          onChange={(e) =>
            setActiveFields({
              ...activeFields,
              bullets: e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </div>

      <div className="rounded-lg border border-border bg-background p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Live preview</p>
        {previewHtml ? (
          <EmbeddedLearningBody
            html={previewHtml}
            title="Preview"
            className="prose prose-sm dark:prose-invert max-w-none"
          />
        ) : (
          <p className="text-xs text-muted-foreground">Fill fields above to preview.</p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-xs"
        onClick={() => {
          if (!showHtml) setHtmlBody(normalizeLocalizedText(block.body));
          setShowHtml((v) => !v);
        }}
      >
        {showHtml ? "Hide advanced HTML" : "Advanced: edit raw HTML"}
      </Button>

      {showHtml && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs">HTML (English)</Label>
            <Textarea
              value={htmlBody.en}
              disabled={disabled}
              rows={8}
              className="mt-1 font-mono text-xs"
              onChange={(e) => {
                const next = { ...htmlBody, en: e.target.value };
                setHtmlBody(next);
                onChange({ body: next });
              }}
            />
          </div>
          <div>
            <Label className="text-xs">HTML (Bangla)</Label>
            <Textarea
              value={htmlBody.bn}
              disabled={disabled}
              rows={8}
              className="mt-1 font-mono text-xs font-bengali"
              onChange={(e) => {
                const next = { ...htmlBody, bn: e.target.value };
                setHtmlBody(next);
                onChange({ body: next });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
