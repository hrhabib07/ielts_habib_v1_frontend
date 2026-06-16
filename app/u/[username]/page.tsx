import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApiBaseUrl } from "@/src/lib/api-base-url";
import { getBearerTokenFromCookie } from "@/src/lib/auth-server";
import type { PublicProfile } from "@/src/lib/api/types";
import { PublicProfilePageContent } from "@/src/components/public-profile/PublicProfilePageContent";

async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  const base = getApiBaseUrl();
  const token = await getBearerTokenFromCookie();
  try {
    const res = await fetch(`${base}/users/${encodeURIComponent(username)}`, {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: PublicProfile };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchPublicProfile(username);
  if (!profile) {
    return { title: "Profile not found · Gamlish" };
  }
  return {
    title: `${profile.displayName} (@${profile.username}) · Gamlish`,
    description: profile.isPrivate
      ? "Private Gamlish profile"
      : `We believe ${profile.displayName} can achieve their IELTS goal of Band ${profile.desiredBandScore ?? profile.progress?.targetBand ?? "—"}.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await fetchPublicProfile(username.toLowerCase());

  if (!profile) {
    notFound();
  }

  return <PublicProfilePageContent initialProfile={profile} />;
}
