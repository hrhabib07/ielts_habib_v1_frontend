import { trackFunnelEvent } from "@/src/lib/api/analytics";
import { readPersistedAiReferral } from "@/src/lib/ai-referral";

/** Local product events + optional funnel bridge for AI / tool analytics. */
export function track(eventName: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  const ai = readPersistedAiReferral();
  const baseMeta = {
    tool: "listening-spelling",
    ...(props ?? {}),
    ...(ai?.isAi
      ? {
          ai_provider: ai.provider,
          from_ai_referral: true,
        }
      : {}),
  };

  if (eventName === "session_started") {
    void trackFunnelEvent({
      event: "tool_session_started",
      path: "/tools/listening-spelling",
      screen: "listening_spelling",
      metadata: baseMeta,
    });
    return;
  }

  if (eventName === "session_completed") {
    void trackFunnelEvent({
      event: "tool_session_completed",
      path: "/tools/listening-spelling",
      screen: "listening_spelling",
      metadata: baseMeta,
    });
    return;
  }

  if (eventName === "follow_recommendation") {
    void trackFunnelEvent({
      event: "tool_follow_recommendation",
      path: "/tools/listening-spelling",
      screen: "listening_spelling_result",
      metadata: baseMeta,
    });
  }
}
