import { FoundingMembersWallContent } from "@/src/components/founding-member/FoundingMembersWallContent";

export const metadata = {
  title: "Founders' Wall | Gamlish",
  description:
    "Early adopters who supported Gamlish with premium access before August 2026.",
};

export default function FoundingMembersPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-background">
      <FoundingMembersWallContent />
    </main>
  );
}
