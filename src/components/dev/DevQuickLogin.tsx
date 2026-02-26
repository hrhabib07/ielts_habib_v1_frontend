"use client";

import { devAccounts } from "@/src/config/devAccounts";

export interface DevQuickLoginProps {
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
}

export default function DevQuickLogin({
  setEmail,
  setPassword,
}: DevQuickLoginProps) {
  if (process.env.NODE_ENV !== "development") return null;

  const handleSelect = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="mb-4 rounded-lg border border-dashed border-yellow-400 bg-yellow-50/50 p-3 dark:border-yellow-600 dark:bg-yellow-950/20">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-yellow-800 dark:text-yellow-200">
        Dev Quick Access
      </p>
      <div className="flex flex-wrap gap-2">
        {devAccounts.map((account) => (
          <button
            key={account.label}
            type="button"
            onClick={() => handleSelect(account.email, account.password)}
            className="rounded-md border border-yellow-300 bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-900 transition-colors hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-100 dark:hover:bg-yellow-800/50"
          >
            Login as {account.label}
          </button>
        ))}
      </div>
    </div>
  );
}
