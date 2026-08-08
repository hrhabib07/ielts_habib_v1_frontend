/**
 * Parallel recommendation tests. Live URLs stay on current content until you approve a swap.
 *
 * | Test | URL | Live (unchanged) | Reject = keep live |
 * |---|---|---|---|
 * | Demo third-person singular | /demo/test · /player/mission-zero-test | /demo · /player/mission-zero (DID) | yes |
 * | Demo save layout A (Google-first) | /demo/test-a | live /demo now also Google-first | yes |
 * | Mission 01 video soft lock + rearrange | /player/mission-one-lab-test | /player/mission-one-lab · course Mission 01 | yes |
 * | Personal offer countdown visual QA | /demo/countdown-test | live landing/pricing countdown | yes |
 * | Final demo save + forced countdown | /demo/save-preview | /demo save screen | yes |
 * | Paid learner story form | /feedback | (new) share with paid users | - |
 * | Admin approve learner stories | /dashboard/admin/learner-feedback | - | - |
 */
export const CONTENT_TEST_ROUTES = {
  demoThirdPerson: "/demo/test",
  demoThirdPersonAuth: "/player/mission-zero-test",
  demoSaveLayoutA: "/demo/test-a",
  missionOneLabRecommendation: "/player/mission-one-lab-test",
  countdownTest: "/demo/countdown-test",
  demoSavePreview: "/demo/save-preview",
  learnerFeedback: "/feedback",
  adminLearnerFeedback: "/dashboard/admin/learner-feedback",
  liveDemo: "/demo",
  liveMissionOneLab: "/player/mission-one-lab",
} as const;
