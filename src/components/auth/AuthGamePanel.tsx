"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { GamlishNavBrand } from "@/src/components/shared/GamlishNavBrand";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import { LevelPreview } from "@/src/features/guest/components/GuestScreens";
import { GUEST_UI } from "@/src/features/guest/copy";
import { guestPath, useGuestWins } from "@/src/features/guest/guestPath";
import { GamlishMascot } from "@/src/features/playground/components/GamlishMascot";
import { cn } from "@/lib/utils";

/** Desktop side of login and sign-up: Gamlish and the same Level 1 path the guest saw on /play. */
export function AuthGamePanel({ locale }: { locale: "en" | "bn" }) {
  const reduceMotion = useReducedMotion();
  const path = guestPath(useGuestWins());
  return (
    <aside className="relative isolate hidden w-[44%] shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-gradient-to-b from-accent/[0.09] via-background to-background px-10 py-10 lg:flex xl:w-[48%] xl:px-12 xl:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_1px_1px,rgba(30,58,138,0.1)_1px,transparent_0)] bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <Link href="/" className="inline-flex w-fit transition-opacity hover:opacity-90">
        <GamlishNavBrand />
      </Link>
      <motion.div
        className="mx-auto my-auto w-full max-w-md text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <GamlishMascot size="lg" className="mx-auto" />
        <p className={cn(LANG_FACE[locale], "mx-auto mt-4 max-w-sm text-lg font-black leading-snug text-slate-800")}>
          {pick(GUEST_UI.welcomeLine(path.topic), locale)}
        </p>
        <div className="mt-6 text-left">
          <LevelPreview path={path} lang={locale} />
        </div>
      </motion.div>
    </aside>
  );
}
