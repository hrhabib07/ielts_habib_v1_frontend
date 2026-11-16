import { saveMetaRegistrationEventId } from "@/src/lib/api/subscription";
import { trackCompleteRegistration } from "@/src/lib/meta-pixel";

type FbqReady = {
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
};

/**
 * Wait until the real fbevents.js is ready (callMethod), or up to 1.5s,
 * then hold ~400ms so the CompleteRegistration beacon can leave the browser
 * before a hard navigation cancels it.
 */
function waitForPixelFlush(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise<void>((resolve) => {
    const start = Date.now();
    const tick = () => {
      const fbq = (window as Window & { fbq?: FbqReady }).fbq;
      const ready = Boolean(fbq?.callMethod);
      if (ready || Date.now() - start > 1500) {
        setTimeout(resolve, 400);
        return;
      }
      setTimeout(tick, 100);
    };
    tick();
  });
}

/**
 * Fire CompleteRegistration after a free-trial account is created, persist
 * event_id for CAPI dedupe, and wait for the pixel flush before navigation.
 */
export async function fireCompleteRegistration(
  eventId?: string,
): Promise<string> {
  const id = trackCompleteRegistration(eventId);
  await Promise.all([
    saveMetaRegistrationEventId(id).catch(() => undefined),
    waitForPixelFlush(),
  ]);
  return id;
}
