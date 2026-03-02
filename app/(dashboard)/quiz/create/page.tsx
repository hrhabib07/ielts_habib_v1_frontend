"use client";

import React, { useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import OptionList from "../../../../components/quiz/OptionList";

type Label = "A" | "B" | "C" | "D" | "E";

type Option = {
  label: Label;
  text: string;
};

type FormValues = {
  question: string;
  options: Option[];
  correctAnswer: Label | "";
};

const defaultOptions: Option[] = [
  { label: "A", text: "" },
  { label: "B", text: "" },
  { label: "C", text: "" },
  { label: "D", text: "" },
];

export default function CreateQuizPage() {
  const { register, control, handleSubmit, setValue, watch } =
    useForm<FormValues>({
      defaultValues: {
        question: "",
        options: defaultOptions,
        correctAnswer: "",
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const options = watch("options");
  const correctAnswer = watch("correctAnswer");

  const hasFifth = useMemo(
    () => fields.length >= 5 && fields[4].label === "E",
    [fields],
  );

  const toggleFifth = () => {
    if (!hasFifth) {
      append({ label: "E", text: "" });
    } else {
      // if correct answer was E, reset it
      if (correctAnswer === "E") setValue("correctAnswer", "");
      remove(4);
    }
  };

  const onSubmit = (data: FormValues) => {
    // final payload
    const payload = {
      question: data.question,
      options: data.options.map((o) => ({ label: o.label, text: o.text })),
      correctAnswer: data.correctAnswer,
    };
    // Replace with API call as needed
    // For now, log to console
    console.log("payload", payload);
    alert(JSON.stringify(payload, null, 2));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Create MCQ Question</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question
            </label>
            <input
              {...register("question")}
              className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Enter the question text"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Options</h2>
              <button
                type="button"
                onClick={toggleFifth}
                className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm bg-white hover:bg-gray-50"
              >
                {hasFifth ? "Remove 5th Option" : "Add 5th Option"}
              </button>
            </div>

            <OptionList
              control={control}
              register={register}
              fields={fields as any}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save Question
            </button>
            <div className="text-sm text-gray-500">
              Select the correct answer using the radio control.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
