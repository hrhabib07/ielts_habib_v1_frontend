"use client";

import { useEffect, useState } from "react";

interface HeartConfettiBurstProps {
  trigger: number;
}

const PARTICLE_COUNT = 18;

export function HeartConfettiBurst({ trigger }: HeartConfettiBurstProps) {
  const [burstId, setBurstId] = useState(0);

  useEffect(() => {
    if (trigger <= 0) return;
    setBurstId(trigger);
  }, [trigger]);

  if (burstId <= 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = (i / PARTICLE_COUNT) * 360;
        const distance = 28 + (i % 5) * 14;
        const hue = i % 3 === 0 ? "340" : i % 3 === 1 ? "45" : "160";
        return (
          <span
            key={`${burstId}-${i}`}
            className="heart-confetti-particle absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
            style={
              {
                "--angle": `${angle}deg`,
                "--distance": `${distance}px`,
                backgroundColor: `hsl(${hue} 85% 58%)`,
                animationDelay: `${i * 18}ms`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
