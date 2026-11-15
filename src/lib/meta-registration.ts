import { saveMetaRegistrationEventId } from "@/src/lib/api/subscription";
import { trackCompleteRegistration } from "@/src/lib/meta-pixel";

/**
 * Fire CompleteRegistration after a free-trial account is created, then store event_id.
 */
export function fireCompleteRegistration(eventId?: string): string {
  const id = trackCompleteRegistration(eventId);
  void saveMetaRegistrationEventId(id).catch(() => undefined);
  return id;
}
