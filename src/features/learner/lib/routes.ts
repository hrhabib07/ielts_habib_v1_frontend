export const MISSION_BASE = "/player/mission-1";

export const missionHref = (stepId: string) => `${MISSION_BASE}/${stepId}`;

/** In-chat payment (and free unlock for learners who paid before v2). */
export const UNLOCK_HREF = `${MISSION_BASE}/unlock`;

/** Every topic's notes as reading only. */
export const NOTES_HREF = `${MISSION_BASE}/notes`;
