"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listWeaknesses, type WeaknessItem } from "@/src/lib/player-weakness";

export default function WeaknessPage() {
  const [items, setItems] = useState<WeaknessItem[]>([]);

  useEffect(() => {
    setItems(listWeaknesses());
  }, []);

  return (
    <main className="mx-auto max-w-lg space-y-5 px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">যেখানে আটকে যাচ্ছ</h1>
      <p className="text-base leading-relaxed text-muted-foreground">
        ভুল হওয়া প্যাটার্নগুলো এখানে জমে। একটা বেছে নিয়ে ছোট প্র্যাকটিস করো।
      </p>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-border/70 bg-card px-4 py-5 text-base">
          এখনো কোনো প্যাটার্ন জমেনি। একটা লেভেল খেললে এখানে দেখা যাবে।
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.label}
              className="rounded-2xl border border-border/70 bg-card px-4 py-4"
            >
              <p className="text-lg font-bold text-foreground">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.count} বার ভুল</p>
              <Link
                href={item.practiceHref}
                className="mt-3 inline-flex text-sm font-bold text-primary"
              >
                ছোট প্র্যাকটিস
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/player" className="inline-flex text-sm font-semibold text-primary">
        লেভেল ম্যাপে ফিরে যাও
      </Link>
    </main>
  );
}
