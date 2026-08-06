import { MissionOneLabFromPack } from "@/src/components/player/MissionOneLabFromPack";
import { MISSION_ONE_LAB_TEST_PACK } from "@/src/lib/mission-one-lab/test-pack";

export const metadata = {
  title: "Mission 01 Test Lab · Gamlish",
  robots: { index: false, follow: false },
};

/** Isolated Mission 01 content test. Does not replace live Mission 01. */
export default function MissionOneLabTestPage() {
  return <MissionOneLabFromPack pack={MISSION_ONE_LAB_TEST_PACK} />;
}
