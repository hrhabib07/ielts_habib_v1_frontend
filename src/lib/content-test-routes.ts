/**
 * Parallel recommendation tests. Live URLs stay on current content until you approve a swap.
 *
 * | Test | URL | Live (unchanged) | Reject = keep live |
 * |---|---|---|---|
 * | Demo third-person singular | /demo/test · /player/mission-zero-test | /demo · /player/mission-zero (DID) | yes |
 * | Demo save layout A (Google-first) | /demo/test-a | /demo · /demo/test (phone-first save) | yes |
 * | Mission 01 video soft lock + rearrange | /player/mission-one-lab-test | /player/mission-one-lab · course Mission 01 | yes |
 */
export const CONTENT_TEST_ROUTES = {
  demoThirdPerson: "/demo/test",
  demoThirdPersonAuth: "/player/mission-zero-test",
  demoSaveLayoutA: "/demo/test-a",
  missionOneLabRecommendation: "/player/mission-one-lab-test",
  liveDemo: "/demo",
  liveMissionOneLab: "/player/mission-one-lab",
} as const;
