import apiClient from "@/src/lib/api-client";
import { getOrCreateVisitorId } from "@/src/lib/analytics-visitor";
import {
  captureConversionAttribution,
  getOrCreateFunnelSessionId,
} from "@/src/lib/conversion-funnel-attribution";
import { metaClickPayloadForAuth } from "@/src/lib/meta-attribution";

export type ConversionFunnelEventName =
  | "visit"
  | "play_start"
  | "note_opened"
  | "note_finished"
  | "quiz_finished"
  | "game_finished"
  | "signup_prompt_view"
  | "signup_started"
  | "signup"
  | "name_saved"
  | "offer_viewed"
  | "offer_dismissed"
  | "unlock_opened"
  | "trial_finished"
  | "pricing_viewed"
  | "trxid_submitted"
  | "paid"
  | "level_completed";

export type ConversionFunnelSource =
  | "meta_ad"
  | "organic_fb"
  | "youtube"
  | "ai"
  | "direct"
  | "other"
  | "all";

export async function logConversionFunnelEvent(input: {
  eventName: ConversionFunnelEventName;
  levelNumber?: number;
  meta?: Record<string, unknown>;
}): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const attr = captureConversionAttribution();
    await apiClient.post("/conversion-funnel/event", {
      eventName: input.eventName,
      anonId: getOrCreateVisitorId(),
      sessionId: getOrCreateFunnelSessionId(),
      levelNumber: input.levelNumber ?? null,
      utmSource: attr.utmSource,
      utmMedium: attr.utmMedium,
      utmCampaign: attr.utmCampaign,
      utmContent: attr.utmContent,
      referrer: attr.referrer,
      meta: input.meta ?? null,
    });
  } catch {
    /* never block UX */
  }
}

export function attributionPayloadForAuth(): {
  visitorId: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  referrer: string | null;
  fbp?: string;
  fbc?: string;
} {
  const attr = captureConversionAttribution();
  return {
    visitorId: getOrCreateVisitorId(),
    utmSource: attr.utmSource,
    utmMedium: attr.utmMedium,
    utmCampaign: attr.utmCampaign,
    utmContent: attr.utmContent,
    referrer: attr.referrer,
    ...metaClickPayloadForAuth(),
  };
}

export interface ConversionFunnelStepRow {
  eventName: ConversionFunnelEventName;
  uniqueUsers: number;
  pctFromPrevious: number | null;
  pctFromVisit: number | null;
  isBiggestDrop: boolean;
}

export interface ConversionFunnelBranch {
  steps: ConversionFunnelStepRow[];
  biggestLeak: string | null;
}

export interface ConversionFunnelDashboard {
  from: string;
  to: string;
  source: ConversionFunnelSource;
  steps: ConversionFunnelStepRow[];
  preReg: ConversionFunnelBranch;
  postReg: ConversionFunnelBranch;
  levelCompleted: number;
}

export async function getConversionFunnelDashboard(params: {
  preset?: "today" | "yesterday" | "last_7_days" | "custom";
  from?: string;
  to?: string;
  source?: ConversionFunnelSource;
}): Promise<ConversionFunnelDashboard> {
  const res = await apiClient.get<{ success: boolean; data: ConversionFunnelDashboard }>(
    "/conversion-funnel/dashboard",
    { params },
  );
  return res.data.data;
}

export async function syncConversionFunnelDay(date: string): Promise<{
  synced: boolean;
  rows: number;
  date: string;
  reason?: string;
}> {
  try {
    const res = await apiClient.post<{
      success: boolean;
      message?: string;
      data: { synced: boolean; rows: number; date: string; reason?: string };
    }>("/conversion-funnel/sync", { date });
    return res.data.data;
  } catch (err) {
    if (err && typeof err === "object" && "response" in err) {
      const ax = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const serverMsg = ax.response?.data?.message;
      if (serverMsg) {
        throw new Error(serverMsg);
      }
    }
    throw err;
  }
}
