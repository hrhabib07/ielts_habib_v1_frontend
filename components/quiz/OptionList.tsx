"use client";

import React from "react";
import { Control, UseFormRegister } from "react-hook-form";
import OptionInput from "./OptionInput";

type Label = "A" | "B" | "C" | "D" | "E";

type OptionField = {
  id?: string;
  label: Label;
  text?: string;
};

type OptionListProps = {
  control: Control<any>;
  register: UseFormRegister<any>;
  fields: OptionField[];
};

export const OptionList: React.FC<OptionListProps> = ({
  control,
  register,
  fields,
}) => {
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
};

export default OptionList;
