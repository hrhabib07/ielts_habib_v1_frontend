import { MissionZeroDemo } from "@/src/components/demo/MissionZeroDemo";

export const metadata = {
  title: "Demo Test A · Google-first save · Gamlish",
  robots: { index: false, follow: false },
};

/**
 * Conversion test A archive: third-person demo + Google-primary save.
 * Live /demo now also uses saveLayout="a" · this page remains TPS variant A.
 */
export default function DemoTestAPage() {
  return (
    <MissionZeroDemo
      mode="guest"
      variant="third-person-a"
      saveLayout="a"
    />
  );
}
