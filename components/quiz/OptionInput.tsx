"use client";

import React from "react";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  type PathValue,
  useController,
  type UseFormRegister,
} from "react-hook-form";

type Label = "A" | "B" | "C" | "D" | "E";

type OptionInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  index: number;
  label: Label;
};

export function OptionInput<TFieldValues extends FieldValues>({
  control,
  register,
  index,
  label,
}: OptionInputProps<TFieldValues>) {
  const name = `options.${index}.text` as FieldPath<TFieldValues>;
  const { field } = useController({
    name,
    control,
    defaultValue: "" as PathValue<TFieldValues, typeof name>,
  });

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex-shrink-0 mt-1">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-medium">
          {label}
        </span>
      </div>

      <div className="flex-1">
        <input
          type="text"
          placeholder={`Option ${label}`}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
          {...field}
        />
      </div>

      <div className="flex items-center">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="radio"
            {...register("correctAnswer" as FieldPath<TFieldValues>)}
            value={label}
            className="w-4 h-4 text-indigo-600"
            aria-label={`Select ${label} as correct answer`}
          />
          <span className="hidden sm:inline">Correct</span>
        </label>
      </div>
    </div>
  );
}

export default OptionInput;
