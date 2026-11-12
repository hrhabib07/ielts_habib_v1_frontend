import type { ChatLessonStep, LessonOption } from "@/src/features/chat-lesson/types";

const LABELS = ["A", "B", "C", "D"] as const;

function options(...items: [en: string, bn: string][]): LessonOption[] {
  return items.map(([en, bn], i) => {
    const label = LABELS[i] ?? String(i + 1);
    return { id: label.toLowerCase(), label, text: { en, bn } };
  });
}

const CORRECT = { en: "Correct!", bn: "সঠিক!" };
const RIGHT = { en: "That's right!", bn: "ঠিক!" };
const GREAT = { en: "Great!", bn: "দারুণ!" };
const WELL_DONE = { en: "Well done!", bn: "সাবাশ!" };
const EXACTLY = { en: "Exactly!", bn: "একদম ঠিক!" };

export const SUBJECT_STEP: ChatLessonStep = {
  id: "level-1-step-3-subject",
  missionLabel: "Level 1",
  stepLabel: "Lesson 2",
  title: { en: "Subject", bn: "সাবজেক্ট" },
  guideName: "Gamlish Guide",
  intro: {
    title: { en: "Why are we starting with the Subject?", bn: "শুরুতেই Subject কেন শিখছি?" },
    text: {
      en: "In Level 1, we will learn how to build a complete English sentence step by step. The first part of any sentence is the Subject, so that is exactly where we begin. After this lesson, you will play 4 short games to practice finding the Subject. Then we will move on to Number, Person, Verb, and Object. And finally, we will learn how to construct a correct sentence very easily.",
      bn: "Level 1-এ আমরা ধাপে ধাপে একটি পূর্ণ ইংরেজি বাক্য তৈরি করা শিখব। যেকোনো বাক্যের প্রথম অংশই হলো Subject, তাই আমাদের শুরুটাও এখান থেকেই। এই লেসনটির পর 4টি ছোট গেইম খেলে Subject চেনার প্র্যাকটিস করবেন। এরপর একে একে আসবে Number, Person, Verb এবং Object। আর সব শেষে আমরা খুব সহজেই একটি সঠিক ইংরেজি বাক্য তৈরি করা শিখে যাব।",
    },
  },
  chunks: [
    {
      id: "what-is-subject",
      title: { en: "What is a Subject?", bn: "Subject কী?" },
      messages: [
        {
          en: "{name}, the **Subject** is the person or thing we talk about in a sentence.",
          bn: "{name}, বাক্যে যার সম্পর্কে কিছু বলা হয়, সে বা সেটিই হলো Subject।",
        },
        {
          en: "To find it, ask yourself, “**Who or what** are we talking about?”",
          bn: "Subject খুঁজে বের করতে নিজেকে প্রশ্ন করুন, “কার সম্পর্কে বা কী সম্পর্কে বলা হচ্ছে?”",
        },
        {
          en: "Ask **Who** for people, like Rafi, my mother, we. Ask **What** for things, like the bus, my phone.",
          bn: "মানুষ হলে প্রশ্ন করুন Who (কে), যেমন Rafi, my mother, we। জিনিস হলে প্রশ্ন করুন What (কী), যেমন the bus, my phone।",
        },
        {
          variant: "example",
          en: "We learn English.",
          bn: "আমরা ইংরেজি শিখি।",
          glosses: [
            { text: "We", bn: "আমরা" },
            { text: "learn", bn: "শিখি" },
            { text: "English", bn: "ইংরেজি" },
          ],
        },
        {
          en: "Question: Who learns English?\nAnswer: **We**\nSo, **We** is the Subject.",
          bn: "প্রশ্ন: কে ইংরেজি শেখে?\nউত্তর: We (আমরা)\nতাই, We হলো Subject।",
        },
        {
          variant: "remember",
          en: "Subject = **Who** (people) or **What** (things)?",
          bn: "Subject = Who (কে, মানুষ) বা What (কী, জিনিস)?",
        },
        {
          en: "Both Bangla and English sentences have a Subject. In Bangla, we usually call it কর্তা. In Gamlish, we only learn the Subject of English sentences, so we will say **Subject**, not কর্তা.",
          bn: "বাংলা ও ইংরেজি দুই ভাষার বাক্যেই Subject থাকে। বাংলায় আমরা একে সাধারণত কর্তা বলি। তবে Gamlish-এ আমরা শুধু ইংরেজি বাক্যের Subject নিয়ে শিখব। তাই বাংলা বাক্যেও আমরা Subject শব্দটিই ব্যবহার করব, কর্তা নয়।",
        },
      ],
      questions: [
        {
          id: "q-subject-find-1",
          prompt: { en: "Find the Subject in this sentence.", bn: "এই বাক্যে Subject কোনটি?" },
          sentence: "We play football.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "play", bn: "খেলি" },
            { text: "football", bn: "ফুটবল" },
          ],
          options: options(["Football", "ফুটবল"], ["We", "আমরা"], ["Play", "খেলি"]),
          englishOptions: true,
          correctOptionId: "b",
          hint: { en: "Ask: Who plays football?", bn: "নিজেকে প্রশ্ন করুন: কে ফুটবল খেলে?" },
          explanation: {
            en: "Ask “Who plays football?” The answer is We, so We is the Subject.",
            bn: "“কে ফুটবল খেলে?” উত্তর হলো We (আমরা)। তাই We হলো Subject।",
          },
        },
        {
          id: "q-subject-find-2",
          prompt: { en: "Which word is the Subject in this sentence?", bn: "এই বাক্যে Subject কোনটি?" },
          sentence: "My friends learn English.",
          sentenceGlosses: [
            { text: "My friends", bn: "আমার বন্ধুরা" },
            { text: "learn", bn: "শেখে" },
            { text: "English", bn: "ইংরেজি" },
          ],
          options: options(["English", "ইংরেজি"], ["Learn", "শেখে"], ["My friends", "আমার বন্ধুরা"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Great work, {name}!", bn: "দারুণ, {name}!" },
          hint: {
            en: "Ask: Who learns English? The answer can be more than one word.",
            bn: "নিজেকে প্রশ্ন করুন: কে ইংরেজি শেখে? উত্তর একাধিক শব্দেরও হতে পারে।",
          },
          explanation: {
            en: "Ask “Who learns English?” The answer is My friends, so My friends is the Subject.",
            bn: "“কে ইংরেজি শেখে?” উত্তর হলো My friends (আমার বন্ধুরা)। তাই My friends হলো Subject।",
          },
        },
      ],
    },
    {
      id: "command-subject",
      title: { en: "Subject in Command Sentences", bn: "আদেশের বাক্যে Subject" },
      messages: [
        {
          en: "Can a sentence have **no Subject**?",
          bn: "বাক্যে কি Subject না-ও থাকতে পারে?",
        },
        {
          variant: "example",
          en: "Open the door!",
          bn: "দরজাটি খোলো!",
          glosses: [
            { text: "Open", bn: "খোলো" },
            { text: "the door", bn: "দরজাটি" },
          ],
        },
        {
          en: "Can you find the Subject in this sentence? We cannot see the Subject directly. However, the sentence tells someone to do something.",
          bn: "এই বাক্যে Subject কি সরাসরি দেখা যাচ্ছে? না, এখানে Subject সরাসরি লেখা নেই। তবে কাউকে একটি কাজ করতে বলা হচ্ছে।",
        },
        {
          en: "We understand that the person receiving the command should open the door. So, the Subject is **you**, even though we do not write it in the sentence.",
          bn: "আমরা বুঝতে পারি, যাকে বলা হচ্ছে, সে দরজাটি খুলবে। তাই এখানে Subject হলো you (তুমি/তোমরা)। কিন্তু বাক্যে Subject-টি লেখা হয়নি।",
        },
        {
          variant: "remember",
          en: "In command sentences, the Subject **you** is usually understood but not written.",
          bn: "কাউকে আদেশ বা নির্দেশ দেওয়ার বাক্যে Subject you সাধারণত লেখা থাকে না, কিন্তু বোঝা যায়।",
        },
      ],
      questions: [
        {
          id: "q-command-door",
          prompt: {
            en: "In “Open the door!”, who should open the door?",
            bn: "“Open the door!” (দরজাটি খোলো!) এখানে কে দরজা খুলবে?",
          },
          options: options(["I", "আমি"], ["You", "তুমি"], ["We", "আমরা"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: CORRECT,
          hint: {
            en: "A command is said to the person you are talking to.",
            bn: "আদেশ দেওয়া হয় যার সঙ্গে কথা বলছেন, তাকে।",
          },
          explanation: {
            en: "The command is given to “you”, but the Subject is not written.",
            bn: "এখানে “তুমি”-কে দরজা খুলতে বলা হচ্ছে, কিন্তু Subject লেখা নেই।",
          },
        },
        {
          id: "q-command-sit",
          prompt: {
            en: "What is the understood Subject in “Sit down!”?",
            bn: "“Sit down!” (বসো!) এই বাক্যে কোন Subject-টি বোঝানো হয়েছে?",
          },
          options: options(["They", "তারা"], ["We", "আমরা"], ["You", "তুমি"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: RIGHT,
          hint: { en: "Who is being told to sit down?", bn: "কাকে বসতে বলা হচ্ছে?" },
          explanation: {
            en: "The sentence tells “you” to sit down.",
            bn: "এখানে “তুমি”-কে বসতে বলা হচ্ছে। তাই Subject হলো “you”, যদিও এটি লেখা নেই।",
          },
        },
        {
          id: "q-command-which",
          prompt: {
            en: "Which sentence has an understood Subject that is not written?",
            bn: "কোন বাক্যে Subject লেখা নেই, কিন্তু তা বোঝা যায়?",
          },
          options: options(
            ["We learn English.", "আমরা ইংরেজি শিখি।"],
            ["Open your book!", "তোমার বই খোলো!"],
            ["They play football.", "তারা ফুটবল খেলে।"],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: CORRECT,
          hint: {
            en: "Look for the sentence that tells someone to do something.",
            bn: "যে বাক্যে কাউকে কিছু করতে বলা হচ্ছে, সেটি খুঁজুন।",
          },
          explanation: {
            en: "In a command, the Subject “you” is usually understood rather than written.",
            bn: "আদেশ বা নির্দেশ দেওয়ার বাক্যে Subject “you” সাধারণত লেখা থাকে না, কিন্তু বোঝা যায়।",
          },
        },
      ],
    },
    {
      id: "compound-subject",
      title: { en: "Compound Subject", bn: "Compound Subject" },
      messages: [
        {
          en: "Can a sentence have **two Subjects**?",
          bn: "একটি বাক্যে কি দুটি Subject থাকতে পারে?",
        },
        {
          variant: "example",
          en: "Rahim and Karim play football.",
          bn: "রহিম ও করিম ফুটবল খেলে।",
          glosses: [
            { text: "Rahim", bn: "রহিম" },
            { text: "and", bn: "ও / এবং" },
            { text: "Karim", bn: "করিম" },
            { text: "play", bn: "খেলে" },
            { text: "football", bn: "ফুটবল" },
          ],
        },
        {
          en: "Who are we talking about in this sentence? We are talking about both **Rahim and Karim**. Here, Rahim and Karim work together as **one Subject**.",
          bn: "এই বাক্যে কার সম্পর্কে বলা হচ্ছে? এখানে রহিম ও করিম দুজনের সম্পর্কেই বলা হচ্ছে। তাই Rahim and Karim একসঙ্গে মিলে বাক্যটির Subject তৈরি করেছে।",
        },
        {
          en: "A Subject can include two or more people or things. When two or more people or things form one Subject, we call it a **Compound Subject**.",
          bn: "একটি Subject-এর মধ্যে দুই বা তার বেশি ব্যক্তি বা বস্তু থাকতে পারে। এভাবে দুই বা তার বেশি ব্যক্তি বা বস্তু মিলে একটি Subject তৈরি করলে তাকে Compound Subject বলে।",
        },
        {
          variant: "remember",
          en: "A Compound Subject has **two or more** people or things joined together as one Subject.",
          bn: "দুই বা তার বেশি ব্যক্তি বা বস্তু একসঙ্গে মিলে একটি Subject তৈরি করতে পারে।",
        },
      ],
      questions: [
        {
          id: "q-compound-rahim",
          prompt: {
            en: "In “Rahim and Karim play football,” which words form the Subject?",
            bn: "“Rahim and Karim play football.” (রহিম ও করিম ফুটবল খেলে।) এখানে কোন শব্দগুলো মিলে Subject তৈরি করেছে?",
          },
          options: options(
            ["Rahim", "রহিম"],
            ["Play football", "ফুটবল খেলে"],
            ["Rahim and Karim", "রহিম ও করিম"],
          ),
          englishOptions: true,
          correctOptionId: "c",
          praise: CORRECT,
          hint: { en: "Who plays football? More than one person!", bn: "কে ফুটবল খেলে? একজনের বেশি!" },
          explanation: {
            en: "Both names work together as one Subject.",
            bn: "দুটি নাম একসঙ্গে মিলে একটি Subject তৈরি করেছে।",
          },
        },
        {
          id: "q-compound-which",
          prompt: { en: "Which sentence has a Compound Subject?", bn: "কোন বাক্যে Compound Subject আছে?" },
          options: options(
            ["We learn English.", "আমরা ইংরেজি শিখি।"],
            ["Mina and Rina read books.", "মিনা ও রিনা বই পড়ে।"],
            ["They play football.", "তারা ফুটবল খেলে।"],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: GREAT,
          hint: { en: "Look for two names joined by “and”.", bn: "“and” দিয়ে যুক্ত দুটি নাম খুঁজুন।" },
          explanation: {
            en: "“Mina and Rina” form one Compound Subject.",
            bn: "“Mina and Rina” একসঙ্গে মিলে একটি Compound Subject তৈরি করেছে।",
          },
        },
        {
          id: "q-compound-count",
          prompt: {
            en: "In “My brother and I play cricket,” how many people form the Subject?",
            bn: "“My brother and I play cricket.” (আমার ভাই ও আমি ক্রিকেট খেলি।) এখানে কতজন মিলে Subject তৈরি করেছে?",
          },
          options: options(["One person", "একজন"], ["Two people", "দুজন"], ["Three people", "তিনজন"]),
          correctOptionId: "b",
          praise: { en: "That's right, {name}!", bn: "ঠিক, {name}!" },
          hint: {
            en: "Count each person in “My brother and I”.",
            bn: "“My brother and I”-এ প্রত্যেক মানুষকে গুনুন।",
          },
          explanation: {
            en: "“My brother and I” includes two people, and together they form the Subject.",
            bn: "“My brother and I” বলতে দুজনকে বোঝায়। তারা একসঙ্গে মিলে Subject তৈরি করেছে।",
          },
        },
      ],
    },
    {
      id: "complete-subject",
      title: { en: "Complete Subject", bn: "Complete Subject" },
      messages: [
        {
          en: "Can a Subject have **many words**?",
          bn: "একটি Subject-এ কি অনেকগুলো শব্দ থাকতে পারে?",
        },
        {
          variant: "example",
          en: "The students in our class learn English.",
          bn: "আমাদের ক্লাসের শিক্ষার্থীরা ইংরেজি শেখে।",
          glosses: [
            { text: "The students", bn: "শিক্ষার্থীরা" },
            { text: "in our class", bn: "আমাদের ক্লাসের" },
            { text: "learn", bn: "শেখে" },
            { text: "English", bn: "ইংরেজি" },
          ],
        },
        {
          en: "Who learns English in this sentence? The answer is **the students in our class**.",
          bn: "এই বাক্যে কারা ইংরেজি শেখে? উত্তর হলো The students in our class (আমাদের ক্লাসের শিক্ষার্থীরা)।",
        },
        {
          en: "Notice that the Subject is not just one word. It includes several words that work together to tell us who the sentence is about.",
          bn: "লক্ষ্য করুন, এখানে Subject শুধু একটি শব্দ নয়। কয়েকটি শব্দ একসঙ্গে মিলে Subject তৈরি করেছে।",
        },
        {
          en: "The complete group of words that tells us who or what the sentence is about is called the **Complete Subject**.",
          bn: "বাক্যে কার সম্পর্কে বা কী সম্পর্কে বলা হচ্ছে, তা বোঝায় এমন সম্পূর্ণ শব্দগুচ্ছকে Complete Subject বলে।",
        },
        {
          variant: "remember",
          en: "A Subject can contain one word or several words. {name}, always find the **complete group** that tells us who or what the sentence is about.",
          bn: "Subject একটি শব্দেরও হতে পারে, আবার একাধিক শব্দেরও হতে পারে। {name}, বাক্যে কার সম্পর্কে বা কী সম্পর্কে বলা হচ্ছে, তা বোঝায় এমন সম্পূর্ণ শব্দগুচ্ছ সবসময় খুঁজে বের করবেন।",
        },
      ],
      questions: [
        {
          id: "q-complete-class",
          prompt: {
            en: "In “The students in our class learn English,” which words make up the complete Subject?",
            bn: "“The students in our class learn English.” (আমাদের ক্লাসের শিক্ষার্থীরা ইংরেজি শেখে।) এখানে কোন শব্দগুলো মিলে Complete Subject তৈরি করেছে?",
          },
          options: options(
            ["Our class", "আমাদের ক্লাস"],
            ["Learn English", "ইংরেজি শেখে"],
            ["The students in our class", "আমাদের ক্লাসের শিক্ষার্থীরা"],
          ),
          englishOptions: true,
          correctOptionId: "c",
          praise: CORRECT,
          hint: {
            en: "Ask: Who learns English? Keep all the words that answer it.",
            bn: "নিজেকে প্রশ্ন করুন: কারা ইংরেজি শেখে? উত্তরের সব শব্দ রাখুন।",
          },
          explanation: {
            en: "The complete Subject tells us who learns English.",
            bn: "Complete Subject আমাদের জানায় কারা ইংরেজি শেখে।",
          },
        },
        {
          id: "q-complete-park",
          prompt: {
            en: "Which words form the complete Subject in “The boys in the park play football”?",
            bn: "“The boys in the park play football.” (পার্কের ছেলেরা ফুটবল খেলে।) এখানে কোন শব্দগুলো মিলে Complete Subject তৈরি করেছে?",
          },
          options: options(
            ["Play football", "ফুটবল খেলে"],
            ["The boys in the park", "পার্কের ছেলেরা"],
            ["The park", "পার্ক"],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: WELL_DONE,
          hint: {
            en: "Ask: Who plays football? Don't stop at one word.",
            bn: "নিজেকে প্রশ্ন করুন: কারা ফুটবল খেলে? এক শব্দে থামবেন না।",
          },
          explanation: {
            en: "“The boys in the park” tells us who plays football.",
            bn: "“The boys in the park” আমাদের জানায় কারা ফুটবল খেলে।",
          },
        },
        {
          id: "q-complete-many",
          prompt: {
            en: "Can a complete Subject contain several words?",
            bn: "একটি Complete Subject কি একাধিক শব্দ নিয়ে গঠিত হতে পারে?",
          },
          options: options(
            ["No, it must be one word.", "না, এটি একটি শব্দই হতে হবে।"],
            ["Yes, it can contain several words.", "হ্যাঁ, এতে একাধিক শব্দ থাকতে পারে।"],
            ["No, it must be two words.", "না, এতে দুটি শব্দই থাকতে হবে।"],
          ),
          correctOptionId: "b",
          praise: EXACTLY,
          hint: {
            en: "Remember “The students in our class”. How many words was that?",
            bn: "“The students in our class” মনে করুন। সেখানে কয়টি শব্দ ছিল?",
          },
          explanation: {
            en: "A complete Subject can contain one word or several words.",
            bn: "Complete Subject একটি শব্দেরও হতে পারে, আবার একাধিক শব্দেরও হতে পারে।",
          },
        },
      ],
    },
    {
      id: "final-review",
      title: { en: "Subject: Final Review", bn: "Subject: ফাইনাল রিভিউ" },
      messages: [
        {
          en: "The Subject tells us **who or what** a sentence is about. It can be **one word or several words**.",
          bn: "Subject আমাদের জানায় বাক্যে কার সম্পর্কে বা কী সম্পর্কে বলা হচ্ছে। এটি একটি বা একাধিক শব্দ নিয়ে গঠিত হতে পারে।",
        },
        {
          en: "In command sentences, the Subject “you” is usually **understood but not written**. A **Compound Subject** joins two or more people or things.",
          bn: "আদেশের বাক্যে Subject “you” সাধারণত লেখা থাকে না, কিন্তু বোঝা যায়। দুই বা তার বেশি ব্যক্তি বা বস্তু মিলে Compound Subject তৈরি করতে পারে।",
        },
        { en: "Now, let's test your understanding, {name}!", bn: "{name}, চলুন, এবার নিজের বোঝাপড়া যাচাই করি!" },
      ],
      questions: [
        {
          id: "q-review-what",
          prompt: { en: "What is a Subject?", bn: "Subject কী?" },
          options: options(
            ["The person or thing we talk about", "যার সম্পর্কে বলা হয়"],
            ["The action in a sentence", "বাক্যের কাজ"],
            ["The thing we receive", "যা আমরা গ্রহণ করি"],
          ),
          correctOptionId: "a",
          praise: CORRECT,
          hint: { en: "Subject = Who or What?", bn: "Subject = কে বা কী?" },
          explanation: {
            en: "The Subject tells us who or what the sentence is about.",
            bn: "Subject আমাদের জানায় বাক্যে কার সম্পর্কে বা কী সম্পর্কে বলা হচ্ছে।",
          },
        },
        {
          id: "q-review-window",
          prompt: {
            en: "What is the understood Subject in “Close the window!”?",
            bn: "“Close the window!” (জানালাটি বন্ধ করো!) বাক্যটিতে কোন Subject বোঝানো হয়েছে?",
          },
          options: options(["We", "আমরা"], ["You", "তুমি"], ["They", "তারা"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: GREAT,
          hint: { en: "Who is being told to close the window?", bn: "কাকে জানালা বন্ধ করতে বলা হচ্ছে?" },
          explanation: {
            en: "In a command, “you” is usually understood but not written.",
            bn: "আদেশের বাক্যে “you” সাধারণত লেখা থাকে না, কিন্তু বোঝা যায়।",
          },
        },
        {
          id: "q-review-compound",
          prompt: { en: "Which sentence has a Compound Subject?", bn: "কোন বাক্যে Compound Subject আছে?" },
          options: options(
            ["They play football.", "তারা ফুটবল খেলে।"],
            ["We learn English.", "আমরা ইংরেজি শিখি।"],
            ["Rahim and Karim read books.", "রহিম ও করিম বই পড়ে।"],
          ),
          englishOptions: true,
          correctOptionId: "c",
          praise: CORRECT,
          hint: {
            en: "A Compound Subject joins two or more people with “and”.",
            bn: "Compound Subject-এ “and” দিয়ে দুই বা তার বেশি জনকে যুক্ত করা হয়।",
          },
          explanation: {
            en: "“Rahim and Karim” work together as one Subject.",
            bn: "“Rahim and Karim” একসঙ্গে মিলে একটি Subject তৈরি করেছে।",
          },
        },
        {
          id: "q-review-complete",
          prompt: {
            en: "What is the complete Subject in “The boys in our school play cricket”?",
            bn: "“The boys in our school play cricket.” (আমাদের স্কুলের ছেলেরা ক্রিকেট খেলে।) এখানে Complete Subject কোনটি?",
          },
          options: options(
            ["Our school", "আমাদের স্কুল"],
            ["The boys in our school", "আমাদের স্কুলের ছেলেরা"],
            ["Play cricket", "ক্রিকেট খেলে"],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: WELL_DONE,
          hint: {
            en: "Ask: Who plays cricket? Keep all the words in the answer.",
            bn: "নিজেকে প্রশ্ন করুন: কারা ক্রিকেট খেলে? উত্তরের সব শব্দ রাখুন।",
          },
          explanation: {
            en: "The complete Subject tells us who plays cricket.",
            bn: "Complete Subject আমাদের জানায় কারা ক্রিকেট খেলে।",
          },
        },
        {
          id: "q-review-books",
          prompt: {
            en: "Which word is the Subject in “We read books”?",
            bn: "“We read books.” (আমরা বই পড়ি।) এখানে Subject কোনটি?",
          },
          options: options(["Books", "বই"], ["Read", "পড়ি"], ["We", "আমরা"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: EXACTLY,
          hint: { en: "Ask: Who reads books?", bn: "নিজেকে প্রশ্ন করুন: কারা বই পড়ে?" },
          explanation: {
            en: "“We” tells us who reads books.",
            bn: "“We” আমাদের জানায় কারা বই পড়ে।",
          },
        },
        {
          id: "q-review-statement",
          prompt: {
            en: "Which statement about a Subject is correct?",
            bn: "Subject সম্পর্কে কোন কথাটি সঠিক?",
          },
          options: options(
            ["A Subject must always be one word.", "Subject সব সময় একটি শব্দ হতে হবে।"],
            ["A Subject can contain several words.", "Subject একাধিক শব্দ নিয়ে গঠিত হতে পারে।"],
            ["A Subject is always an action.", "Subject সব সময় একটি কাজ বোঝায়।"],
          ),
          correctOptionId: "b",
          praise: { en: "Excellent, {name}!", bn: "চমৎকার, {name}!" },
          hint: {
            en: "Think of “The boys in our school”.",
            bn: "“The boys in our school” কথাটি মনে করুন।",
          },
          explanation: {
            en: "A Subject can be one word or a group of words.",
            bn: "Subject একটি শব্দ বা একাধিক শব্দের সমষ্টি হতে পারে।",
          },
        },
      ],
    },
  ],
};
