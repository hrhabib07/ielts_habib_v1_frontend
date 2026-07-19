import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getApiBaseUrl } from "@/src/lib/api-base-url";
import { getBearerTokenFromCookie } from "@/src/lib/auth-server";
import type { GamlishPublicProfile } from "@/src/lib/api/gamlish";
import { GamlishProfileContent } from "@/src/components/public-profile/GamlishProfileContent";

async function fetchGamlishProfile(
  handle: string,
): Promise<GamlishPublicProfile | null> {
  const base = getApiBaseUrl();
  const token = await getBearerTokenFromCookie();
  try {
    const res = await fetch(
      `${base}/users/${encodeURIComponent(handle)}/gamlish`,
      {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    );
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: GamlishPublicProfile };
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
  const profile = await fetchGamlishProfile(username.toLowerCase());
  if (!profile) {
    return { title: "Profile not found · Gamlish" };
  }
  const { identity } = profile;
  const handle = identity.username ?? profile.canonicalHandle;
  return {
    title: `${identity.displayName} (@${handle}) · Gamlish`,
    description: identity.isFoundingMember
      ? `${identity.displayName} is a Gamlish Founding Member — Founder #${identity.founderNumber}.`
      : `${identity.displayName}'s Gamlish learning profile.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const handle = username.toLowerCase();
  const profile = await fetchGamlishProfile(handle);

  if (!profile) {
    notFound();
  }

  // Old public-id / previous-username links permanently redirect to the current handle.
  if (!profile.isCanonical && profile.canonicalHandle) {
    redirect(`/u/${profile.canonicalHandle}`);
  }

  return <GamlishProfileContent initialProfile={profile} handle={handle} />;
}
