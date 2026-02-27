import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ContentPreviewView } from "@/src/components/contents/ContentPreviewView";
import type { LearningContentPreview } from "@/src/lib/api/learningContents";

const TOKEN_COOKIE = "ielts_habib_token";

async function fetchContentPreview(
  id: string,
  token: string,
): Promise<LearningContentPreview | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return null;

  const res = await fetch(`${baseUrl}/admin/contents/${id}/preview`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

export default async function ContentPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) {
    notFound();
  }

  const content = await fetchContentPreview(id, token);
  if (!content) {
    notFound();
  }

  return (
    <ContentPreviewView
      content={content}
      backHref="/dashboard/instructor/contents"
      backLabel="Back to Content Management"
    />
  );
}
