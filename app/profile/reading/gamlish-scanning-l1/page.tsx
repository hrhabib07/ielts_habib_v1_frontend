"use client";

import { useRouter } from "next/navigation";
import { GamlishScanningPracticeView } from "@/src/components/reading/gamlish-scanning/GamlishScanningPracticeView";

export default function GamlishScanningL1Page() {
  const router = useRouter();

  return (
    <GamlishScanningPracticeView
      onBack={() => router.push("/profile/reading")}
    />
  );
}
