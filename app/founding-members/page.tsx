import { FoundingMembersWallContent } from "@/src/components/founding-member/FoundingMembersWallContent";

export const metadata = {
  title: "Founders' Wall | Gamlish",
  description:
    "ফাউন্ডারস ওয়াল  -  Gamlish-এর প্রথম 100 Founding Member. Permanent badge, number, and Founder price before 31 July 2026, 11:59 PM BD.",
};

export default function FoundingMembersPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-background">
      <FoundingMembersWallContent />
    </main>
  );
}
