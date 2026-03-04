"use client";

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
