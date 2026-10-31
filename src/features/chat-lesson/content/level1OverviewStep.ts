import type { ChatLessonStep, LessonChunk } from "@/src/features/chat-lesson/types";

/** Merged into Start Here (`introStep.ts`); the old standalone step is kept as a draft. */
export const LEVEL1_OVERVIEW_STEP: ChatLessonStep = {
  id: "level-1-step-2-overview",
  missionLabel: "Level 1",
  stepLabel: "Step 2",
  title: { en: "What will you learn in Level 1?", bn: "লেভেল 1-এ কী শিখবেন?" },
  guideName: "Gamlish Guide",
  status: "draft",
  chunks: [
    {
      id: "basics",
      title: { en: "Start from the basics", bn: "বেসিক থেকে শুরু" },
      messages: [
        {
          en: "Let's start building your English from the **basics**, {name}!",
          bn: "{name}, চলুন, ইংরেজি শেখার শুরুটা বেসিক থেকেই করি!",
        },
        {
          en: "In Level 1, you will discover **how English sentences work**.",
          bn: "লেভেল 1-এ আপনি শিখবেন ইংরেজি বাক্য কীভাবে তৈরি হয়।",
        },
        {
          en: "You will start with simple concepts, learn how to put words together, and practise making **correct English sentences** step by step.",
          bn: "সহজ বিষয় দিয়ে শুরু করে ধাপে ধাপে শব্দ সাজিয়ে সঠিক ইংরেজি বাক্য তৈরি করতে শিখবেন।",
        },
      ],
      questions: [
        {
          id: "q-level1-make",
          prompt: {
            en: "What will you learn to make in Level 1?",
            bn: "লেভেল 1-এ আপনি কী তৈরি করতে শিখবেন?",
          },
          options: [
            { id: "a", label: "A", text: { en: "Correct English sentences", bn: "সঠিক ইংরেজি বাক্য" } },
            { id: "b", label: "B", text: { en: "Long English stories", bn: "লম্বা ইংরেজি গল্প" } },
            { id: "c", label: "C", text: { en: "Advanced English essays", bn: "অ্যাডভান্সড ইংরেজি রচনা" } },
          ],
          correctOptionId: "a",
          praise: { en: "Correct, {name}!", bn: "সঠিক, {name}!" },
          hint: {
            en: "Think small: Level 1 is about the basics, not long writing.",
            bn: "ছোট করে ভাবুন: লেভেল 1 বেসিক নিয়ে, লম্বা লেখা নিয়ে নয়।",
          },
          explanation: {
            en: "In Level 1, you learn how to put words together and make correct English sentences step by step.",
            bn: "লেভেল 1-এ আপনি শব্দ সাজিয়ে ধাপে ধাপে সঠিক ইংরেজি বাক্য তৈরি করতে শিখবেন।",
          },
        },
      ],
    },
    {
      id: "topics",
      title: { en: "Your Level 1 map", bn: "আপনার লেভেল 1-এর ম্যাপ" },
      messages: [
        {
          en: "{name}, here is what you will learn. In Gamlish, we use the English names: Subject, Number, Person, Verb and Object.",
          bn: "{name}, এই লেভেলে আপনি শিখবেন নিচের বিষয়গুলো। Gamlish-এ আমরা ইংরেজি নামগুলোই ব্যবহার করব: Subject, Number, Person, Verb, Object।",
          items: [
            {
              term: "Subject",
              termBn: "বাংলা ব্যাকরণে কর্তা",
              en: "Who are we talking about?",
              bn: "আমরা কার কথা বলছি?",
            },
            {
              term: "Number",
              termBn: "বাংলা ব্যাকরণে বচন",
              en: "Are we talking about one or more than one?",
              bn: "একজন বা একটি, নাকি একাধিক?",
            },
            {
              term: "Person",
              termBn: "বাংলা ব্যাকরণে পুরুষ",
              en: "Who is speaking, who is listening, and who are we talking about?",
              bn: "কে কথা বলছে, কাকে বলা হচ্ছে, আর কার কথা বলা হচ্ছে?",
            },
            {
              term: "Verb",
              termBn: "বাংলা ব্যাকরণে ক্রিয়া",
              en: "What is the action? Plus am, is and are.",
              bn: "কী কাজ হচ্ছে? সঙ্গে am, is আর are।",
            },
            {
              term: "Object",
              termBn: "বাংলা ব্যাকরণে কর্ম",
              en: "Who or what receives the action?",
              bn: "কাজটি কাকে বা কিসের ওপর করা হচ্ছে?",
            },
            {
              term: "Word Order",
              termBn: "শব্দের ক্রম",
              en: "How are English sentences different from Bangla sentences?",
              bn: "বাংলা ও ইংরেজি বাক্যে শব্দ সাজানোর পার্থক্য কী?",
            },
            {
              term: "Sentence Formulas",
              termBn: "বাক্য তৈরির ফর্মুলা",
              en: "How can you use simple patterns to make correct English sentences?",
              bn: "সহজ কিছু প্যাটার্ন দিয়ে কীভাবে সঠিক ইংরেজি বাক্য তৈরি করা যায়?",
            },
          ],
        },
        {
          en: "Every topic has a **lesson** to learn it and a **playground** to practise it with games. At the end, take the **Mission 1 Final Test** to check your progress.",
          bn: "প্রতিটি বিষয়ে আছে একটি লেসন (শেখার জন্য) আর একটি প্লেগ্রাউন্ড (গেম খেলে অনুশীলনের জন্য)। শেষে মিশন 1-এর ফাইনাল টেস্ট দিয়ে নিজের শেখা যাচাই করবেন।",
        },
        {
          en: "Start with the basics. Practise as you play. Build your English **one sentence at a time**.",
          bn: "বেসিক থেকে শুরু করুন, খেলতে খেলতে অনুশীলন করুন, আর ধাপে ধাপে ইংরেজি বাক্য তৈরি করতে শিখুন।",
        },
      ],
      questions: [
        {
          id: "q-mission1-end",
          prompt: {
            en: "What will you do at the end of Mission 1?",
            bn: "মিশন 1-এর শেষে আপনি কী করবেন?",
          },
          options: [
            { id: "a", label: "A", text: { en: "Start Level 5", bn: "লেভেল 5 শুরু করবেন" } },
            {
              id: "b",
              label: "B",
              text: { en: "Take the Mission 1 Final Test", bn: "মিশন 1-এর ফাইনাল টেস্ট দেবেন" },
            },
            { id: "c", label: "C", text: { en: "Learn a new language", bn: "নতুন একটি ভাষা শিখবেন" } },
          ],
          correctOptionId: "b",
          praise: { en: "Well done, {name}!", bn: "সাবাশ, {name}!" },
          hint: {
            en: "Every mission ends with something that checks your progress.",
            bn: "প্রতিটি মিশনের শেষে এমন কিছু আছে যা আপনার শেখা যাচাই করে।",
          },
          explanation: {
            en: "At the end of Mission 1, you take the Mission 1 Final Test to check what you have learned.",
            bn: "মিশন 1-এর শেষে আপনি মিশন 1-এর ফাইনাল টেস্ট দিয়ে নিজের শেখা যাচাই করবেন।",
          },
        },
      ],
    },
  ],
};

/** The "Your Level 1 map" part, reused as the last part of Start Here. */
export const LEVEL1_MAP_CHUNK: LessonChunk = LEVEL1_OVERVIEW_STEP.chunks.find((chunk) => chunk.id === "topics") ?? {
  id: "topics",
  title: { en: "Your Level 1 map", bn: "আপনার লেভেল 1-এর ম্যাপ" },
  messages: [],
  questions: [],
};
