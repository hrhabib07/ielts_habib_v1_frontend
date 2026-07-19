import type { Metadata } from "next";
import { ChooseUsernameForm } from "@/src/components/username/ChooseUsernameForm";

export const metadata: Metadata = {
  title: "Choose your username · Gamlish",
  description: "Claim your permanent Gamlish username.",
};

export default function UsernamePage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-background px-4 py-12">
      <ChooseUsernameForm />
    </main>
  );
}
