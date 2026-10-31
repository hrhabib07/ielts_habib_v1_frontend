import type { ChatLessonStep } from "@/src/features/chat-lesson/types";
// Relative `.ts` import so the Node audio/export scripts can load this file directly.
import { LEVEL1_MAP_CHUNK } from "./level1OverviewStep.ts";

/** Start Here: the welcome plus the Level 1 map (merged from the old Overview step). */
export const INTRO_STEP: ChatLessonStep = {
  id: "mission-1-step-1-intro",
  missionLabel: "Level 1",
  stepLabel: "Lesson 1",
  title: { en: "Start Here", bn: "এখান থেকে শুরু" },
  guideName: "Gamlish Guide",
  chunks: [
    {
      id: "what-is-gamlish",
      title: { en: "What is Gamlish?", bn: "গ্যামলিশ কী?" },
      messages: [
        { en: "Welcome to **Gamlish**, {name}!", bn: "গ্যামলিশে স্বাগতম, {name}!" },
        {
          en: "Gamlish is a **game for learning English**.",
          bn: "গ্যামলিশ ইংরেজি শেখার একটি গেম।",
        },
        {
          en: "It is made for **English learners in Bangladesh**.",
          bn: "এটি বাংলাদেশের ইংরেজি শিক্ষার্থীদের জন্য তৈরি।",
        },
      ],
      questions: [
        {
          id: "q-what-is",
          prompt: { en: "What is Gamlish?", bn: "গ্যামলিশ কী?" },
          options: [
            {
              id: "a",
              label: "A",
              text: { en: "A regular English course", bn: "সাধারণ ইংরেজি শেখার কোর্স" },
            },
            {
              id: "b",
              label: "B",
              text: { en: "A game for learning English", bn: "ইংরেজি শেখার একটি গেম" },
            },
            {
              id: "c",
              label: "C",
              text: { en: "A new type of spicy biryani", bn: "নতুন ধরনের ঝাল বিরিয়ানি" },
            },
          ],
          correctOptionId: "b",
          hint: {
            en: "Look at the name: Gam + lish. Where does \"Gam\" come from?",
            bn: "নামটা খেয়াল করুন: Gam + lish। \"Gam\" কোন শব্দ থেকে এসেছে?",
          },
          explanation: {
            en: "Gamlish is a game for learning English, made for learners in Bangladesh. The name mixes Game + English.",
            bn: "গ্যামলিশ ইংরেজি শেখার একটি গেম, বাংলাদেশের শিক্ষার্থীদের জন্য তৈরি। নামটা Game আর English মিলিয়ে তৈরি।",
          },
        },
      ],
    },
    {
      id: "how-it-works",
      title: {
        en: "How does Gamlish make learning fun?",
        bn: "গ্যামলিশ কীভাবে শেখাকে মজার করে তোলে?",
      },
      messages: [
        {
          en: "Gamlish makes learning English grammar fun and easy through a game with **21 levels**.",
          bn: "গ্যামলিশে 21টি লেভেলের একটি গেমের মাধ্যমে আপনি সহজে ও মজা করে ইংরেজি গ্রামার শিখতে পারবেন।",
        },
        {
          en: "{name}, you will start from **Level 1** with very easy grammar topics. As you play, you will slowly move to higher levels and learn more difficult topics **step by step**.",
          bn: "{name}, আপনি লেভেল 1 থেকে একদম সহজ গ্রামার দিয়ে শুরু করবেন। খেলতে খেলতে ধীরে ধীরে পরের লেভেলগুলোতে যাবেন এবং একটু একটু করে কঠিন বিষয় শিখবেন।",
        },
        {
          en: "You will **practise** what you learn and use grammar to make correct English sentences.",
          bn: "যা শিখবেন, তা অনুশীলন করবেন এবং সঠিক ইংরেজি বাক্য তৈরি করতে শিখবেন।",
        },
        {
          en: "By completing the levels, you will build a **strong foundation** in English grammar and learn how to use it in real life.",
          bn: "এভাবে সব লেভেল শেষ করার মাধ্যমে ইংরেজি গ্রামারের বেসিক থেকে ভালো একটা ভিত্তি তৈরি হবে, যা আপনি বাস্তব জীবনেও কাজে লাগাতে পারবেন।",
        },
      ],
      questions: [
        {
          id: "q-levels",
          prompt: {
            en: "How many levels does Gamlish have?",
            bn: "গ্যামলিশে কয়টি লেভেল আছে?",
          },
          options: [
            { id: "a", label: "A", text: { en: "10 levels", bn: "10টি লেভেল" } },
            { id: "b", label: "B", text: { en: "21 levels", bn: "21টি লেভেল" } },
            { id: "c", label: "C", text: { en: "50 levels", bn: "50টি লেভেল" } },
          ],
          correctOptionId: "b",
          praise: { en: "Correct, {name}!", bn: "সঠিক, {name}!" },
          hint: {
            en: "It is more than 20, but much less than 50.",
            bn: "সংখ্যাটা 20-এর বেশি, কিন্তু 50-এর অনেক কম।",
          },
          explanation: {
            en: "Gamlish has 21 levels. You start at Level 1 and climb one level at a time.",
            bn: "গ্যামলিশে 21টি লেভেল আছে। আপনি লেভেল 1 থেকে শুরু করে একটা একটা করে লেভেল পার হবেন।",
          },
        },
        {
          id: "q-step-by-step",
          prompt: {
            en: "How will you learn more difficult grammar topics in Gamlish?",
            bn: "গ্যামলিশে আপনি কীভাবে ধীরে ধীরে কঠিন গ্রামার শিখবেন?",
          },
          options: [
            {
              id: "a",
              label: "A",
              text: { en: "By starting with difficult topics", bn: "কঠিন বিষয় দিয়ে শুরু করে" },
            },
            {
              id: "b",
              label: "B",
              text: {
                en: "By memorising grammar rules without practice",
                bn: "অনুশীলন ছাড়া গ্রামারের নিয়ম মুখস্থ করে",
              },
            },
            {
              id: "c",
              label: "C",
              text: {
                en: "By starting with easy topics and moving to harder ones step by step",
                bn: "সহজ বিষয় দিয়ে শুরু করে ধাপে ধাপে কঠিন বিষয় শেখার মাধ্যমে",
              },
            },
          ],
          correctOptionId: "c",
          hint: {
            en: "Where do you start in Gamlish: Level 1, or the hardest level?",
            bn: "গ্যামলিশে আপনি কোথা থেকে শুরু করেন: লেভেল 1, নাকি সবচেয়ে কঠিন লেভেল?",
          },
          explanation: {
            en: "You begin with very easy topics at Level 1, practise them, and then move to harder topics step by step.",
            bn: "লেভেল 1-এ একদম সহজ বিষয় দিয়ে শুরু করবেন, অনুশীলন করবেন, তারপর ধাপে ধাপে কঠিন বিষয়ে যাবেন।",
          },
        },
      ],
    },
    {
      id: "points",
      title: {
        en: "What will you learn from Gamlish?",
        bn: "গ্যামলিশ থেকে আপনি কী শিখবেন?",
      },
      messages: [
        {
          en: "Gamlish helps you learn English grammar **practically** through a fun game. You will learn the basics of grammar and practise what you learn at every step.",
          bn: "গ্যামলিশে আপনি মজার গেমের মাধ্যমে practically ইংরেজি গ্রামার শিখবেন। গ্রামারের বেসিক বিষয়গুলো শেখার পাশাপাশি প্রতিটি ধাপে অনুশীলন করবেন।",
        },
        {
          en: "Give the correct answer and earn **1 point**!",
          bn: "সঠিক উত্তর দিলে পাবেন 1 পয়েন্ট!",
        },
        {
          en: "Make a mistake? No worries, {name}! You will get a **warning and another chance**. Answer correctly after the warning and earn **0.5 points**.",
          bn: "ভুল হলে চিন্তা নেই, {name}! আপনি পাবেন একটি সতর্কবার্তা এবং আবার উত্তর দেওয়ার সুযোগ। সতর্কবার্তার পর সঠিক উত্তর দিলে পাবেন 0.5 পয়েন্ট।",
        },
        {
          en: "Still can't get it right? You get **0 points**, but you can learn from your mistake and try again!",
          bn: "এরপরও সঠিক উত্তর দিতে না পারলে পাবেন 0 পয়েন্ট। তবে ভুল থেকে শিখে আবার চেষ্টা করতে পারবেন!",
        },
        {
          en: "By playing and practising, you will learn how to make correct English sentences and build a strong foundation for **writing and speaking**.",
          bn: "এভাবে খেলতে খেলতে ও অনুশীলনের মাধ্যমে আপনি সঠিক ইংরেজি বাক্য তৈরি করতে শিখবেন এবং ইংরেজি লেখা ও বলার জন্য একটি মজবুত ভিত্তি তৈরি করবেন।",
        },
      ],
      questions: [
        {
          id: "q-first-try",
          prompt: {
            en: "How many points do you get for a correct answer on your first try?",
            bn: "প্রথমবারেই সঠিক উত্তর দিলে আপনি কত পয়েন্ট পাবেন?",
          },
          options: [
            { id: "a", label: "A", text: { en: "0.5 points", bn: "0.5 পয়েন্ট" } },
            { id: "b", label: "B", text: { en: "0 points", bn: "0 পয়েন্ট" } },
            { id: "c", label: "C", text: { en: "1 point", bn: "1 পয়েন্ট" } },
          ],
          correctOptionId: "c",
          hint: {
            en: "First try, no mistakes. Is that the biggest score, or a smaller one?",
            bn: "প্রথমবারেই, কোনো ভুল ছাড়া। এতে কি সবচেয়ে বেশি পয়েন্ট, নাকি কম?",
          },
          explanation: {
            en: "A correct answer on your first try earns 1 point. That is the full score for a question.",
            bn: "প্রথমবারেই সঠিক উত্তর দিলে পাবেন 1 পয়েন্ট। এটাই একটি প্রশ্নের পুরো পয়েন্ট।",
          },
        },
        {
          id: "q-wrong-answer",
          prompt: {
            en: "What happens if you give a wrong answer?",
            bn: "ভুল উত্তর দিলে কী হবে?",
          },
          options: [
            {
              id: "a",
              label: "A",
              text: { en: "You will lose all your points.", bn: "আপনার সব পয়েন্ট চলে যাবে।" },
            },
            {
              id: "b",
              label: "B",
              text: {
                en: "You will get a warning and another chance.",
                bn: "আপনি একটি সতর্কবার্তা ও আবার উত্তর দেওয়ার সুযোগ পাবেন।",
              },
            },
            {
              id: "c",
              label: "C",
              text: {
                en: "You will finish the level immediately.",
                bn: "আপনার লেভেল সঙ্গে সঙ্গে শেষ হয়ে যাবে।",
              },
            },
          ],
          correctOptionId: "b",
          hint: {
            en: "Gamlish says: \"Make a mistake? No worries!\"",
            bn: "গ্যামলিশ বলে: \"ভুল হলে চিন্তা নেই!\"",
          },
          explanation: {
            en: "A mistake is not the end. You get a warning and one more chance to answer.",
            bn: "ভুল করলেই শেষ নয়। আপনি একটি সতর্কবার্তা আর আবার উত্তর দেওয়ার সুযোগ পাবেন।",
          },
        },
        {
          id: "q-after-warning",
          prompt: {
            en: "How many points do you get if you answer correctly after a warning?",
            bn: "সতর্কবার্তা পাওয়ার পর সঠিক উত্তর দিলে আপনি কত পয়েন্ট পাবেন?",
          },
          options: [
            { id: "a", label: "A", text: { en: "1 point", bn: "1 পয়েন্ট" } },
            { id: "b", label: "B", text: { en: "0 points", bn: "0 পয়েন্ট" } },
            { id: "c", label: "C", text: { en: "0.5 points", bn: "0.5 পয়েন্ট" } },
          ],
          correctOptionId: "c",
          praise: { en: "Great work, {name}!", bn: "দারুণ, {name}!" },
          hint: {
            en: "After a warning you still get some points, but not the full point.",
            bn: "সতর্কবার্তার পরেও কিছু পয়েন্ট পাবেন, তবে পুরো পয়েন্ট নয়।",
          },
          explanation: {
            en: "Correct after a warning earns 0.5 points. Still wrong after that? 0 points, but you learn from it.",
            bn: "সতর্কবার্তার পর সঠিক উত্তর দিলে পাবেন 0.5 পয়েন্ট। এরপরও ভুল হলে 0 পয়েন্ট, তবে ভুল থেকে শিখবেন।",
          },
        },
      ],
    },
    {
      id: "why-gamlish",
      title: { en: "Why Gamlish?", bn: "কেন Gamlish?" },
      messages: [
        {
          en: "We know how frustrating English can feel when you struggle to make even a simple sentence.",
          bn: "ইংরেজিতে একটা সাধারণ বাক্য তৈরি করতেও যখন সমস্যা হয়, তখন কেমন লাগে, তা আমরা বুঝি।",
        },
        {
          en: "As **Bangladeshis and English educators**, we understand these challenges because we see them every day. That is why we built Gamlish!",
          bn: "আমরা বাংলাদেশি এবং ইংরেজি শেখানোর অভিজ্ঞতা থেকে প্রতিদিন শিক্ষার্থীদের এই সমস্যাগুলো দেখি। তাই আমরা তৈরি করেছি Gamlish!",
        },
        {
          en: "Here, you don't just memorise grammar rules. You learn them practically, practise what you learn, and build correct English sentences through a **fun game**.",
          bn: "এখানে আপনি শুধু গ্রামারের নিয়ম মুখস্থ করবেন না। মজার গেমের মাধ্যমে গ্রামার শিখবেন, অনুশীলন করবেন এবং ধাপে ধাপে সঠিক ইংরেজি বাক্য তৈরি করতে শিখবেন।",
        },
        {
          en: "Start with the basics, move forward at your own pace, and improve **one mission at a time**.",
          bn: "একদম সহজ বিষয় দিয়ে শুরু করুন, নিজের গতিতে এগিয়ে চলুন আর প্রতিটি মিশনের সঙ্গে নিজের দক্ষতা বাড়ান।",
        },
        {
          en: "You don't need to know English to start, {name}. You just need to **start learning**!",
          bn: "{name}, ইংরেজি শেখা শুরু করুন, আত্মবিশ্বাস নিয়ে এগিয়ে চলুন!",
        },
      ],
      questions: [
        {
          id: "q-how-learn",
          prompt: {
            en: "How will you learn grammar in Gamlish?",
            bn: "Gamlish-এ আপনি কীভাবে গ্রামার শিখবেন?",
          },
          options: [
            {
              id: "a",
              label: "A",
              text: { en: "By memorising grammar rules only", bn: "শুধু গ্রামারের নিয়ম মুখস্থ করে" },
            },
            {
              id: "b",
              label: "B",
              text: { en: "By starting with the hardest topics", bn: "সবচেয়ে কঠিন বিষয় দিয়ে শুরু করে" },
            },
            {
              id: "c",
              label: "C",
              text: {
                en: "By learning and practising grammar through a fun game, one mission at a time",
                bn: "মজার গেমের মাধ্যমে একেকটি মিশনে গ্রামার শিখে ও অনুশীলন করে",
              },
            },
          ],
          correctOptionId: "c",
          hint: {
            en: "In Gamlish you don't just memorise rules. You learn them through a ___.",
            bn: "গ্যামলিশে শুধু নিয়ম মুখস্থ নয়। শেখা হয় একটি ___ এর মাধ্যমে।",
          },
          explanation: {
            en: "In Gamlish you learn grammar through a fun game, practise it, and improve one mission at a time.",
            bn: "গ্যামলিশে আপনি মজার গেমের মাধ্যমে গ্রামার শিখবেন, অনুশীলন করবেন এবং একেকটি মিশনে উন্নতি করবেন।",
          },
        },
        {
          id: "q-why-built",
          prompt: {
            en: "Why did the team create Gamlish?",
            bn: "Gamlish টিম কেন ইংরেজি শেখার গেম তৈরি করেছে?",
          },
          options: [
            {
              id: "a",
              label: "A",
              text: {
                en: "To help Bangladeshi learners overcome their English learning challenges",
                bn: "বাংলাদেশি শিক্ষার্থীদের ইংরেজি শেখার সমস্যা কাটিয়ে উঠতে সাহায্য করতে",
              },
            },
            {
              id: "b",
              label: "B",
              text: { en: "To help people play games only", bn: "শুধু গেম খেলতে সাহায্য করতে" },
            },
            {
              id: "c",
              label: "C",
              text: {
                en: "To teach only advanced English grammar",
                bn: "শুধু অ্যাডভান্সড ইংরেজি গ্রামার শেখাতে",
              },
            },
          ],
          correctOptionId: "a",
          hint: {
            en: "The team are Bangladeshi English educators. Who do they see struggling every day?",
            bn: "টিমের সবাই বাংলাদেশি ইংরেজি শিক্ষক। তারা প্রতিদিন কাদের সমস্যায় পড়তে দেখেন?",
          },
          explanation: {
            en: "The team sees Bangladeshi learners struggle with English every day, so they built Gamlish to help them.",
            bn: "টিম প্রতিদিন বাংলাদেশি শিক্ষার্থীদের ইংরেজি নিয়ে সমস্যায় পড়তে দেখে, তাই তাদের সাহায্য করতে Gamlish তৈরি করেছে।",
          },
        },
      ],
    },
    LEVEL1_MAP_CHUNK,
  ],
};
