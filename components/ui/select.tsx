"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SelectContextType = {
  value: string | null;
  setValue: (v: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
};

const SelectContext = React.createContext<SelectContextType | null>(null);

function Select({
  children,
  value: controlledValue,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string | null>(
    controlledValue ?? null,
  );

  React.useEffect(() => {
    if (controlledValue !== undefined) setInternalValue(controlledValue);
  }, [controlledValue]);

  const setValue = (v: string) => {
    if (onValueChange) onValueChange(v);
    setInternalValue(v);
    setOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{ value: internalValue, setValue, open, setOpen }}
    >
      <div className="relative inline-block">{children}</div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        "flex items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm",
        className,
      )}
    >
      {children}
    </button>
  );
}

function SelectValue({ placeholder = "Select" }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return <span>{ctx.value ?? placeholder}</span>;
}

function SelectContent({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  if (!ctx.open) return null;
  return (
    <div
      className={cn(
        "absolute z-50 mt-2 max-h-56 w-[200px] overflow-auto rounded-md border bg-white p-1 shadow-lg dark:bg-stone-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SelectItem({
  value,
  children,
}: {
  value: string;
  children?: React.ReactNode;
}) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        "w-full text-left px-2 py-1 text-sm hover:bg-stone-100 dark:hover:bg-stone-800",
        ctx.value === value ? "font-medium" : "",
      )}
    >
      {children}
    </button>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
