import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { LevelPreviewView } from "@/src/components/levels/LevelPreviewView";
import type { LevelPreviewResponse } from "@/src/lib/api/levels";

const TOKEN_COOKIE = "ielts_habib_token";

async function fetchLevelPreview(
  levelId: string,
  token: string,
): Promise<LevelPreviewResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) return null;

  const res = await fetch(
    `${baseUrl}/admin/levels/${levelId}/preview`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

export default async function InstructorLevelPreviewPage({
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

  const data = await fetchLevelPreview(id, token);
  if (!data) {
    notFound();
  }

  return (
    <LevelPreviewView
      data={data}
      backHref={`/dashboard/instructor/levels/${id}`}
      backLabel="Back to level"
    />
  );
}
