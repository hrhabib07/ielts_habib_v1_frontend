import type { ChatLessonStep } from "@/src/features/chat-lesson/types";

/**
 * Start Here · one short note + one fun check.
 * Tone: warm, local, clear. Learn English by playing. No memorizing.
 */
export const INTRO_STEP: ChatLessonStep = {
  id: "mission-1-step-1-intro",
  missionLabel: "Level 1",
  stepLabel: "Lesson 1",
  title: { en: "Start Here", bn: "এখান থেকে শুরু" },
  guideName: "Gamlish Guide",
  chunks: [
    {
      id: "what-is-gamlish",
      title: { en: "What is Gamlish?", bn: "Gamlish কী?" },
      messages: [
        {
          en: "Hi {name}! Glad you're here.",
          bn: "হাই {name}! আপনাকে পেয়ে খুব ভালো লাগছে।",
        },
        {
          en: "**Gamlish** means Game + English. You play small games and learn English as you go. No boring memorizing.",
          bn: "**Gamlish** মানে Game + English। ছোট ছোট গেম খেলবেন, আর খেলতে খেলতেই ইংরেজি শিখবেন। বোরিং মুখস্থ নেই।",
        },
        {
          en: "Every great English journey starts with one answer. Give it a try, then start exploring **Subject** on the map!",
          bn: "ইংরেজি শেখার প্রতিটি সুন্দর যাত্রা শুরু হয় একটি উত্তর দিয়ে। চেষ্টা করে দেখুন, তারপর **Subject** দিয়ে শুরু করুন!",
        },
      ],
      questions: [
        {
          id: "q-what-is",
          prompt: { en: "What is Gamlish?", bn: "Gamlish কী?" },
          options: [
            {
              id: "a",
              label: "A",
              text: {
                en: "A street-side fuchka stall with extra tetul water",
                bn: "রাস্তার পাশের এক্সট্রা তেঁতুল-জলওয়ালা ফুচকার দোকান",
              },
            },
            {
              id: "b",
              label: "B",
              text: {
                en: "A game where you learn English by playing",
                bn: "একটা গেম, যেখানে খেলতে খেলতে ইংরেজি শিখবেন",
              },
            },
            {
              id: "c",
              label: "C",
              text: {
                en: "A brand-new type of spicy biryani",
                bn: "একদম নতুন রকমের ঝাল ঝাল বিরিয়ানি",
              },
            },
          ],
          correctOptionId: "b",
          hint: {
            en: "Look at the two words inside the name: Game + ... ?",
            bn: "নামের ভেতর লুকানো শব্দ দুটো দেখুন: Game + ... ?",
          },
          explanation: {
            en: "Gamlish = Game + English. You play, and you learn English as you go. No memorizing lists.",
            bn: "Gamlish = Game + English। আপনি খেলবেন, আর খেলতে খেলতেই ইংরেজি শিখবেন। লিস্ট মুখস্থ করতে হবে না।",
          },
        },
      ],
    },
  ],
};
