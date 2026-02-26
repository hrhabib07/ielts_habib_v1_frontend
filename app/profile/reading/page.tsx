"use client";

import { RedirectToLevels } from "./RedirectToLevels";

/**
 * Reading entry: redirects to levels list so students always see
 * levels when they open Reading. Levels are fetched on /profile/reading/levels.
 */
export default function ProfileReadingPage() {
  return (
    <div className="space-y-8">
      <RedirectToLevels />
    </div>
  );
}
