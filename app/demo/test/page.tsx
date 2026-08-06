import { MissionZeroDemo } from "@/src/components/demo/MissionZeroDemo";

export const metadata = {
  title: "Demo Test · Third Person Singular · Gamlish",
  robots: { index: false, follow: false },
};

/**
 * Recommendation demo: he/she/it + -s/-es.
 * Live DID demo stays at /demo. Reject = keep /demo only.
 */
export default function DemoTestPage() {
  return <MissionZeroDemo mode="guest" variant="third-person" />;
}
