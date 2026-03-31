"use client";

import React from "react";
import type { Control, FieldValues, UseFormRegister } from "react-hook-form";
import OptionInput from "./OptionInput";

type Label = "A" | "B" | "C" | "D" | "E";

type OptionField = {
  id?: string;
  label: Label;
  text?: string;
};

type OptionListProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  fields: OptionField[];
};

export function OptionList<TFieldValues extends FieldValues>({
  control,
  register,
  fields,
}: OptionListProps<TFieldValues>) {
  return (
    <div className="space-y-3">
      {fields.map((f, idx) => (
        <OptionInput
          key={f.id ?? f.label}
          control={control}
          register={register}
          index={idx}
          label={f.label}
        />
      ))}
    </div>
  );
}

export default OptionList;
