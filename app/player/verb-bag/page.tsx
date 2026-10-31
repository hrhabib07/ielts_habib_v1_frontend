import { VerbBagView } from "@/src/components/player/VerbBagView";
import { LegacyMissionGate } from "@/src/features/learner/components/LegacyMissionGate";

export default function VerbBagPage() {
  return (
    <LegacyMissionGate>
      <VerbBagView />
    </LegacyMissionGate>
  );
}
