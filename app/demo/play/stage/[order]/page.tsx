"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DemoStageRunner } from "@/src/components/demo/DemoStageRunner";
import { readDemoSessionId } from "@/src/lib/demo-session";

export default function DemoStagePage() {
  const params = useParams();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const stageOrder = Number(params.order);

  useEffect(() => {
    const sid = readDemoSessionId();
    if (!sid) {
      router.replace("/demo");
      return;
    }
    setSessionId(sid);
  }, [router]);

  if (!sessionId || !Number.isFinite(stageOrder)) {
    return null;
  }

  return <DemoStageRunner sessionId={sessionId} stageOrder={stageOrder} />;
}
