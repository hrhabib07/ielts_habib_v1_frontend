"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Eye, FileText, Video, Lightbulb, BarChart2 } from "lucide-react";
import type { LearningContentPreview, LearningContentType } from "@/src/lib/api/learningContents";

const TYPE_ICONS: Record<LearningContentType, React.ReactNode> = {
  INTRO: <FileText className="h-4 w-4" />,
  NOTE: <Lightbulb className="h-4 w-4" />,
  STRATEGY: <Lightbulb className="h-4 w-4" />,
  VIDEO: <Video className="h-4 w-4" />,
  ANALYTICS: <BarChart2 className="h-4 w-4" />,
};

const TYPE_LABELS: Record<LearningContentType, string> = {
  INTRO: "Intro",
  NOTE: "Note",
  STRATEGY: "Strategy",
  VIDEO: "Video",
  ANALYTICS: "Analytics",
};

function getEmbedUrl(
  url: string,
): { type: "iframe" | "video"; src: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const watchMatch = trimmed.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch?.[1]) {
    return { type: "iframe", src: `https://www.youtube.com/embed/${watchMatch[1]}` };
  }

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch?.[1]) {
    return { type: "iframe", src: `https://www.youtube.com/embed/${shortMatch[1]}` };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch?.[1]) {
    return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  if (trimmed.toLowerCase().endsWith(".mp4")) {
    return { type: "video", src: trimmed };
  }

  return null;
}

export interface ContentPreviewViewProps {
  content: LearningContentPreview;
  backHref: string;
  backLabel: string;
}

export function ContentPreviewView({
  content,
  backHref,
  backLabel,
}: ContentPreviewViewProps) {
  const type = content.type as LearningContentType;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-2">
        <Link href={backHref}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
      </div>

      <Card className="border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/30 dark:bg-amber-950/20">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Eye className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Preview Mode — This content is not editable here
          </p>
        </div>
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300/90">
          To edit, use the Content Management table and click Edit.
        </p>
      </Card>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {TYPE_ICONS[type]}
            {TYPE_LABELS[type]}
          </span>
          {!content.isPublished && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Draft
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{content.title}</h1>
      </div>

      {type === "VIDEO" && content.videoUrl && (() => {
        const embed = getEmbedUrl(content.videoUrl);
        if (!embed) {
          return (
            <Card className="p-6">
              <div className="text-sm text-red-500">
                Invalid or unsupported video URL
              </div>
            </Card>
          );
        }
        if (embed.type === "iframe") {
          return (
            <Card className="overflow-hidden p-0">
              <div className="aspect-video w-full bg-muted">
                <iframe
                  title={content.title}
                  src={embed.src}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </Card>
          );
        }
        return (
          <Card className="overflow-hidden p-0">
            <div className="aspect-video w-full bg-muted">
              <video controls className="w-full rounded-xl">
                <source src={embed.src} type="video/mp4" />
              </video>
            </div>
          </Card>
        );
      })()}

      {content.body && (
        <Card className="p-6">
          <div
            className="content-preview text-foreground [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_p]:mb-3 [&_p]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_ul]:list-inside [&_ul]:list-disc [&_ol]:list-inside [&_ol]:list-decimal [&_li]:mb-1"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        </Card>
      )}

      {!content.body && type !== "VIDEO" && (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No body content.</p>
        </Card>
      )}

      <div className="border-t pt-4">
        <Link href={backHref}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
