import { MissionZeroDemo } from "@/src/components/demo/MissionZeroDemo";

export const metadata = {
  title: "Demo Test A · Google-first save · Gamlish",
  robots: { index: false, follow: false },
};

/**
 * Conversion test A: third-person demo + Google-primary save screen.
 * Live /demo and /demo/test keep the phone-first save layout.
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
