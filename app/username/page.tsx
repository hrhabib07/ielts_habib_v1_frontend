import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ChooseUsernameForm } from "@/src/components/username/ChooseUsernameForm";

export const metadata: Metadata = {
  title: "Choose your username · Gamlish",
  description: "Claim your permanent Gamlish username.",
};

function UsernameFormFallback() {
  return (
    <div className="flex justify-center py-16 text-muted-foreground">
      <Loader2 className="h-7 w-7 animate-spin" />
    </div>
  );
}

export default function UsernamePage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-background px-4 py-12">
      <Suspense fallback={<UsernameFormFallback />}>
        <ChooseUsernameForm />
      </Suspense>
    </main>
  );
}
