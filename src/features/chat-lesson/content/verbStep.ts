import type { ChatLessonStep } from "@/src/features/chat-lesson/types";
// Relative `.ts` import so the Node audio/export scripts can load this file directly.
import { LETS_TEST, options, PRAISE, table } from "./helpers.ts";

const VERB_COLUMN = { en: "Verb", bn: "Verb" };
const EXAMPLE_COLUMN = { en: "Example", bn: "উদাহরণ" };
const MEANING_COLUMN = { en: "Meaning", bn: "বাংলা অর্থ" };

export const VERB_STEP: ChatLessonStep = {
  id: "level-1-step-7-verb",
  missionLabel: "Level 1",
  stepLabel: "Lesson 5",
  title: { en: "Meet the Verb", bn: "Verb-এর সঙ্গে পরিচিত হোন" },
  guideName: "Gamlish",
  teacherNote:
    "Teach action Verbs, one English word for Bangla করা actions, and the three being Verbs (am, is, are) linked to Person. Don't introduce tense, questions, negatives or adding s/es to action Verbs yet.",
  chunks: [
    {
      id: "what-is-verb",
      title: { en: "What is a Verb?", bn: "Verb কী?" },
      messages: [
        {
          en: "{name}, a **Verb** is a word that tells us **what someone or something does**, or **what happens**.",
          bn: "{name}, Verb এমন একটি শব্দ, যা দিয়ে বোঝা যায় কেউ বা কিছু কী করে, অথবা কী ঘটে।",
          table: table(
            [VERB_COLUMN, EXAMPLE_COLUMN],
            [
              ["eat", { en: "I eat rice.", bn: "I eat rice. (আমি ভাত খাই।)" }],
              ["play", { en: "We play football.", bn: "We play football. (আমরা ফুটবল খেলি।)" }],
              ["read", { en: "You read books.", bn: "You read books. (তুমি বই পড়ো।)" }],
              ["sleep", { en: "Babies sleep.", bn: "Babies sleep. (শিশুরা ঘুমায়।)" }],
            ],
          ),
        },
        {
          en: "The words **eat**, **play**, **read** and **sleep** are Verbs. They tell us what someone does.",
          bn: "এখানে eat, play, read এবং sleep হলো Verb। এগুলো দিয়ে বোঝা যায় কেউ কী করে।",
        },
        {
          en: "You may see an **-s** on some Verbs, like “Rahim learns”. Don't worry about it now. You will learn why in a later mission.",
          bn: "কিছু Verb-এর শেষে -s দেখতে পারেন, যেমন “Rahim learns”। এখন এটা নিয়ে চিন্তা করবেন না। কেন -s বসে, তা পরের একটি মিশনে শিখবেন।",
        },
      ],
      questions: [
        {
          id: "q-verb-rafi-morning",
          prompt: {
            en: "Rafi wants to describe what he does every morning. Which word can he use to show an action?",
            bn: "রাফি প্রতিদিন সকালে সে কী করে, তা বোঝাতে চায়। কাজ বোঝানোর জন্য সে কোন শব্দটি ব্যবহার করতে পারে?",
          },
          options: options(["Morning", "সকাল"], ["Study", "পড়াশোনা করা"], ["Rafi", "রাফি"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: {
            en: "An action is something you do. Can you “morning”? Can you “study”?",
            bn: "কাজ মানে যা করা যায়। “morning” কি করা যায়? “study” কি করা যায়?",
          },
          explanation: {
            en: "“Study” tells us about an action.",
            bn: "“Study” দিয়ে একটি কাজ বোঝানো হয়।",
          },
        },
        {
          id: "q-verb-baby-cries",
          prompt: {
            en: "A learner writes, “The baby cries.” Which word tells us what happens?",
            bn: "একজন শিক্ষার্থী লিখল, “The baby cries.” এখানে কোন শব্দটি দিয়ে বোঝা যায় কী ঘটছে?",
          },
          options: options(["Baby", "শিশু"], ["The", "টি"], ["Cries", "কাঁদে"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.wellDone,
          hint: { en: "What is the baby doing?", bn: "শিশুটি কী করছে?" },
          explanation: {
            en: "“Cries” tells us what happens, so it is the Verb.",
            bn: "“Cries” দিয়ে কী ঘটছে তা বোঝা যায়, তাই এটি Verb।",
          },
        },
      ],
    },
    {
      id: "find-the-verb",
      title: { en: "Find the Verb in a Sentence", bn: "বাক্যে Verb খুঁজে বের করুন" },
      messages: [
        {
          en: "To find a Verb, look for the word that tells us **what someone does** or **what happens**.",
          bn: "কোনো বাক্যে Verb খুঁজে পেতে দেখুন, কোন শব্দটি দিয়ে বোঝা যায় কেউ কী করে বা কী ঘটে।",
        },
        {
          variant: "example",
          en: "We play football.",
          bn: "আমরা ফুটবল খেলি।",
          glosses: [
            { text: "We", bn: "আমরা" },
            { text: "play", bn: "খেলি" },
            { text: "football", bn: "ফুটবল" },
          ],
        },
        {
          en: "Subject: **We**\nVerb: **play**\nObject: **football**",
          bn: "Subject: We (আমরা)\nVerb: play (খেলি)\nObject: football (ফুটবল)",
        },
      ],
      questions: [
        {
          id: "q-verb-clean-classroom",
          prompt: { en: "Which word is the Verb in this sentence?", bn: "এই বাক্যে কোন শব্দটি Verb?" },
          sentence: "We clean the classroom.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "clean", bn: "পরিষ্কার করি" },
            { text: "the classroom", bn: "শ্রেণিকক্ষ" },
          ],
          options: options(["We", "আমরা"], ["Clean", "পরিষ্কার করি"], ["Classroom", "শ্রেণিকক্ষ"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "Which word tells us what we do?", bn: "কোন শব্দটি বলে আমরা কী করি?" },
          explanation: {
            en: "“Clean” tells us what we do.",
            bn: "“Clean” দিয়ে বোঝা যায় আমরা কী করি।",
          },
        },
        {
          id: "q-verb-children-storybooks",
          prompt: {
            en: "Which word is the Subject and which is the Verb?",
            bn: "এই বাক্যে Subject এবং Verb কোনগুলো?",
          },
          sentence: "The children read storybooks.",
          sentenceGlosses: [
            { text: "The children", bn: "শিশুরা" },
            { text: "read", bn: "পড়ে" },
            { text: "storybooks", bn: "গল্পের বই" },
          ],
          options: options(
            ["Subject: read, Verb: children"],
            ["Subject: storybooks, Verb: read"],
            ["Subject: the children, Verb: read"],
          ),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Great, {name}!", bn: "দারুণ, {name}!" },
          hint: {
            en: "Ask “Who?” to find the Subject. Then ask “What do they do?”",
            bn: "Subject পেতে জিজ্ঞেস করুন “কে?”। তারপর জিজ্ঞেস করুন “তারা কী করে?”",
          },
          explanation: {
            en: "“The children” tells us who the sentence is about, and “read” tells us what they do.",
            bn: "“The children” দিয়ে বোঝা যায় কাদের সম্পর্কে বলা হচ্ছে, আর “read” দিয়ে বোঝা যায় তারা কী করে।",
          },
        },
      ],
    },
    {
      id: "different-actions",
      title: { en: "Verbs Show Different Actions", bn: "Verb দিয়ে বিভিন্ন কাজ বোঝায়" },
      messages: [
        {
          en: "We use **different Verbs** for different actions.",
          bn: "বিভিন্ন কাজ বোঝাতে আমরা বিভিন্ন Verb ব্যবহার করি।",
          table: table(
            [VERB_COLUMN, EXAMPLE_COLUMN, MEANING_COLUMN],
            [
              ["eat", "I eat rice.", "খাওয়া"],
              ["drink", "We drink water.", "পান করা"],
              ["write", "You write notes.", "লেখা"],
              ["run", "They run fast.", "দৌড়ানো"],
              ["help", "We help our parents.", "সাহায্য করা"],
              ["swim", "They swim in the pond.", "সাঁতার কাটা"],
            ],
          ),
        },
        {
          en: "The word that shows the action in a sentence is the **Verb**.",
          bn: "বাক্যে কাজটি বোঝায় যে শব্দ, সেটিই হলো Verb।",
        },
        {
          variant: "remember",
          en: "A **Verb** tells us what someone or something does, or what happens. Look for the Verb to understand the action in a sentence.",
          bn: "Verb দিয়ে বোঝা যায় কেউ বা কিছু কী করে, অথবা কী ঘটে। বাক্যে কাজ বা ঘটনা বুঝতে Verb খুঁজে বের করুন।",
        },
      ],
      questions: [
        {
          id: "q-verb-rafi-water",
          prompt: {
            en: "Rafi is thirsty. Which Verb does he need?",
            bn: "রাফির পিপাসা পেয়েছে। তার কোন Verb দরকার?",
          },
          options: options(["Eat", "খাওয়া"], ["Drink", "পান করা"], ["Write", "লেখা"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "We don't eat water. We…?", bn: "আমরা পানি খাই না, পানি…?" },
          explanation: {
            en: "Drink tells us the action of taking liquid into the body.",
            bn: "Drink দিয়ে কোনো তরল পান করার কাজ বোঝায়।",
          },
        },
        {
          id: "q-verb-swim-pool",
          prompt: { en: "Read the sentence. Which action do the people do?", bn: "বাক্যটি পড়ুন। এখানে তারা কোন কাজটি করে?" },
          sentence: "They swim in the pond.",
          sentenceGlosses: [
            { text: "They", bn: "তারা" },
            { text: "swim", bn: "সাঁতার কাটে" },
            { text: "in the pond", bn: "পুকুরে" },
          ],
          options: options(
            ["They run fast.", "তারা দ্রুত দৌড়ায়।"],
            ["They swim.", "তারা সাঁতার কাটে।"],
            ["They write notes.", "তারা নোট লেখে।"],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "Where are they? In the pond!", bn: "ওরা কোথায়? পুকুরে!" },
          explanation: {
            en: "Swim tells us the action of moving through water.",
            bn: "Swim দিয়ে পানিতে সাঁতার কাটার কাজ বোঝায়।",
          },
        },
        {
          id: "q-verb-mina-paper",
          prompt: {
            en: "Mina wants to put her ideas on paper. Which Verb can she use?",
            bn: "মিনা তার চিন্তাগুলো কাগজে লিখতে চায়। সে কোন Verb ব্যবহার করতে পারে?",
          },
          options: options(["Sleep", "ঘুমানো"], ["Eat", "খাওয়া"], ["Write", "লেখা"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: { en: "What do you do with a pen and paper?", bn: "কলম আর কাগজ দিয়ে আপনি কী করেন?" },
          explanation: {
            en: "Write tells us the action of putting words on paper.",
            bn: "Write দিয়ে কাগজে কিছু লেখার কাজ বোঝায়।",
          },
        },
      ],
    },
    {
      id: "one-word-kora",
      title: { en: "One Word for “করা”", bn: "“করা”-এর জন্য একটি শব্দ" },
      messages: [
        {
          en: "In Bangla, many actions use **করা**: পরিষ্কার করা, সাহায্য করা, রান্না করা. In English, each of these is just **one** word.",
          bn: "বাংলায় অনেক কাজ “করা” দিয়ে বলা হয়: পরিষ্কার করা, সাহায্য করা, রান্না করা। ইংরেজিতে এগুলোর প্রতিটি মাত্র একটি শব্দ।",
          table: table(
            [{ en: "Bangla", bn: "বাংলা" }, VERB_COLUMN],
            [
              ["পরিষ্কার করা", "clean"],
              ["সাহায্য করা", "help"],
              ["রান্না করা", "cook"],
              ["অপেক্ষা করা", "wait"],
              ["ফোন করা", "call"],
              ["পড়াশোনা করা", "study"],
              ["কাজ করা", "work"],
              ["শুরু করা", "start"],
              ["শেষ করা", "finish"],
              ["চেষ্টা করা", "try"],
            ],
          ),
        },
        {
          variant: "example",
          en: "We clean the room.",
          bn: "আমরা ঘর পরিষ্কার করি।",
          glosses: [
            { text: "We", bn: "আমরা" },
            { text: "clean", bn: "পরিষ্কার করি" },
            { text: "the room", bn: "ঘর" },
          ],
        },
        {
          en: "Not: “We **do** clean the room.” The word করা does not become “do”.",
          bn: "“We do clean the room.” নয়। “করা” মানেই “do” নয়।",
        },
        {
          variant: "remember",
          en: "{name}, find the **one** English action word. “do” has other jobs that you will learn later. In simple sentences like these, don't add it.",
          bn: "{name}, একটিমাত্র ইংরেজি কাজের শব্দটি খুঁজে নিন। “do”-এর অন্য কাজ আছে, যা পরে শিখবেন। এই ধরনের সহজ বাক্যে “do” যোগ করবেন না।",
        },
      ],
      questions: [
        {
          id: "q-verb-kora-help",
          prompt: { en: "Which English sentence is correct?", bn: "কোন ইংরেজি বাক্যটি সঠিক?" },
          sourceBn: "আমি মাকে সাহায্য করি।",
          options: options(["I do help my mother."], ["I help my mother."], ["I help do my mother."]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "সাহায্য করা is one English word.", bn: "“সাহায্য করা” ইংরেজিতে একটি শব্দ।" },
          explanation: {
            en: "সাহায্য করা = help. No extra “do”.",
            bn: "সাহায্য করা = help। বাড়তি “do” লাগবে না।",
          },
        },
        {
          id: "q-verb-kora-wait",
          prompt: { en: "What is “অপেক্ষা করা” in English?", bn: "“অপেক্ষা করা” ইংরেজিতে কী?" },
          options: options(["do wait"], ["make wait"], ["wait"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.great,
          hint: { en: "One word only.", bn: "শুধু একটি শব্দ।" },
          explanation: { en: "অপেক্ষা করা = wait.", bn: "অপেক্ষা করা = wait।" },
        },
        {
          id: "q-verb-kora-study",
          prompt: { en: "Which English sentence is correct?", bn: "কোন ইংরেজি বাক্যটি সঠিক?" },
          sourceBn: "তারা প্রতিদিন পড়াশোনা করে।",
          options: options(["They do study every day."], ["They study every day."], ["They study do every day."]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.wellDone,
          hint: { en: "পড়াশোনা করা is one English word.", bn: "“পড়াশোনা করা” ইংরেজিতে একটি শব্দ।" },
          explanation: { en: "পড়াশোনা করা = study.", bn: "পড়াশোনা করা = study।" },
        },
      ],
    },
    {
      id: "being-verbs",
      title: { en: "English Always Needs a Verb", bn: "ইংরেজিতে Verb লাগবেই" },
      messages: [
        {
          en: "Look at this Bangla sentence: **আমি ছাত্র।** There is no action word, and it is still correct in Bangla.",
          bn: "এই বাংলা বাক্যটি দেখুন: আমি ছাত্র। এখানে কোনো কাজ বোঝানো শব্দ নেই, তবুও বাংলায় বাক্যটি সঠিক।",
        },
        {
          en: "In English, every sentence needs a Verb. “I student.” is wrong. We add a small Verb: **I am a student.**",
          bn: "ইংরেজিতে প্রতিটি বাক্যে একটি Verb লাগবেই। “I student.” ভুল। ছোট একটি Verb যোগ করতে হয়: I am a student।",
        },
        {
          en: "**am**, **is** and **are** are Verbs too. They don't show an action. They tell us what someone or something is, how it is, or where it is. We call them **being Verbs**.",
          bn: "am, is এবং are-ও Verb। এগুলো কোনো কাজ বোঝায় না। এগুলো বলে কেউ বা কিছু কী, কেমন, বা কোথায়। এদের বলা হয় being Verb।",
          table: table(
            [
              { en: "Subject", bn: "Subject" },
              VERB_COLUMN,
              EXAMPLE_COLUMN,
            ],
            [
              ["I", "am", { en: "I am a student.", bn: "I am a student. (আমি ছাত্র।)" }],
              [
                { en: "He / She / It, one person or thing", bn: "He / She / It, একজন বা একটি" },
                "is",
                { en: "Rafi is tall. The rice is hot.", bn: "Rafi is tall. (রাফি লম্বা।) The rice is hot. (ভাত গরম।)" },
              ],
              [
                { en: "We / You / They, more than one", bn: "We / You / They, একাধিক" },
                "are",
                { en: "We are ready. You are my friend.", bn: "We are ready. (আমরা প্রস্তুত।) You are my friend. (তুমি আমার বন্ধু।)" },
              ],
            ],
          ),
        },
        {
          variant: "example",
          en: "The books are on the table.",
          bn: "বইগুলো টেবিলের ওপর।",
          glosses: [
            { text: "The books", bn: "বইগুলো" },
            { text: "are", bn: "আছে" },
            { text: "on the table", bn: "টেবিলের ওপর" },
          ],
        },
        {
          variant: "remember",
          en: "No Verb in Bangla? English still needs one.\n**I** → am\nOne person or thing → is\n**You** and more than one → are\n“You” always takes “are”, even for one person.",
          bn: "বাংলায় Verb নেই? ইংরেজিতে তবুও লাগবে।\nI → am\nএকজন বা একটি → is\nYou এবং একাধিক → are\n“You”-এর সঙ্গে সবসময় “are”, একজন হলেও।",
        },
      ],
      questions: [
        {
          id: "q-verb-being-ready",
          prompt: { en: "Which English sentence is correct?", bn: "কোন ইংরেজি বাক্যটি সঠিক?" },
          sourceBn: "আমি প্রস্তুত।",
          options: options(["I ready."], ["I am ready."], ["I is ready."]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "English always needs a Verb. Which one goes with I?", bn: "ইংরেজিতে Verb লাগবেই। I-এর সঙ্গে কোনটি বসে?" },
          explanation: { en: "I → am. So: I am ready.", bn: "I → am। তাই: I am ready।" },
        },
        {
          id: "q-verb-being-sister",
          prompt: { en: "My sister ___ a doctor.", bn: "My sister ___ a doctor. (আমার বোন একজন ডাক্তার।) শূন্যস্থানে কোনটি বসবে?" },
          options: options(["am"], ["is"], ["are"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: { en: "My sister is one person.", bn: "আমার বোন একজন।" },
          explanation: { en: "One person → is.", bn: "একজন হলে → is।" },
        },
        {
          id: "q-verb-being-students",
          prompt: {
            en: "The students ___ in the classroom.",
            bn: "The students ___ in the classroom. (শিক্ষার্থীরা শ্রেণিকক্ষে আছে।) শূন্যস্থানে কোনটি বসবে?",
          },
          options: options(["is"], ["am"], ["are"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: { en: "Students: one or more than one?", bn: "Students: একজন, নাকি একাধিক?" },
          explanation: { en: "More than one → are.", bn: "একাধিক হলে → are।" },
        },
        {
          id: "q-verb-being-you",
          prompt: { en: "You ___ my best friend.", bn: "You ___ my best friend. (তুমি আমার সবচেয়ে ভালো বন্ধু।) শূন্যস্থানে কোনটি বসবে?" },
          options: options(["is"], ["are"], ["am"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: { en: "Excellent, {name}!", bn: "চমৎকার, {name}!" },
          hint: { en: "“You” has its own rule, even for one person.", bn: "“You”-এর নিজস্ব নিয়ম আছে, একজন হলেও।" },
          explanation: { en: "“You” always takes “are”.", bn: "“You”-এর সঙ্গে সবসময় “are” বসে।" },
        },
      ],
    },
    {
      id: "verb-review",
      title: { en: "Verb: Final Review", bn: "Verb: চূড়ান্ত অনুশীলন" },
      messages: [
        {
          en: "{name}, a **Verb** tells us what someone or something does, or what happens.",
          bn: "{name}, Verb দিয়ে বোঝা যায় কেউ বা কিছু কী করে, অথবা কী ঘটে।",
        },
        LETS_TEST,
      ],
      questions: [
        {
          id: "q-verb-review-which",
          prompt: { en: "Which word is a Verb?", bn: "কোন শব্দটি Verb?" },
          options: options(["Book", "বই"], ["Eat", "খাওয়া"], ["Happy", "খুশি"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "Which one can you do?", bn: "কোনটা করা যায়?" },
          explanation: { en: "“Eat” tells us an action.", bn: "“Eat” দিয়ে একটি কাজ বোঝানো হয়।" },
        },
        {
          id: "q-verb-review-drink",
          prompt: { en: "Which word is the Verb in this sentence?", bn: "এই বাক্যে কোন শব্দটি Verb?" },
          sentence: "We drink water.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "drink", bn: "পান করি" },
            { text: "water", bn: "পানি" },
          ],
          options: options(["We", "আমরা"], ["Water", "পানি"], ["Drink", "পান করা"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.great,
          hint: { en: "What do we do with water?", bn: "পানি দিয়ে আমরা কী করি?" },
          explanation: { en: "“Drink” tells us what we do.", bn: "“Drink” দিয়ে বোঝা যায় আমরা কী করি।" },
        },
        {
          id: "q-verb-review-read",
          prompt: { en: "Which word tells us the action?", bn: "কোন শব্দটি কাজ বোঝায়?" },
          sentence: "You read a book.",
          sentenceGlosses: [
            { text: "You", bn: "তুমি" },
            { text: "read", bn: "পড়ো" },
            { text: "a book", bn: "একটি বই" },
          ],
          options: options(["You", "তুমি"], ["Read", "পড়া"], ["Book", "বই"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.wellDone,
          hint: { en: "What do you do with a book?", bn: "বই দিয়ে আপনি কী করেন?" },
          explanation: { en: "“Read” is the Verb.", bn: "“Read” হলো Verb।" },
        },
        {
          id: "q-verb-review-sentence",
          prompt: {
            en: "Which sentence has an action Verb (not a being Verb)?",
            bn: "কোন বাক্যে কাজ বোঝায় এমন Verb আছে (being Verb নয়)?",
          },
          options: options(
            ["The bag is blue.", "ব্যাগটি নীল।"],
            ["The room is big.", "ঘরটি বড়।"],
            ["They run fast.", "তারা দ্রুত দৌড়ায়।"],
          ),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: { en: "Look for a word that shows an action.", bn: "কাজ বোঝায় এমন শব্দ খুঁজুন।" },
          explanation: {
            en: "“is” is a being Verb. “run” is an action Verb: it tells us what they do.",
            bn: "“is” হলো being Verb। “run” হলো কাজের Verb: এটি বলে তারা কী করে।",
          },
        },
        {
          id: "q-verb-review-children",
          prompt: { en: "Which word is the Verb in this sentence?", bn: "এই বাক্যে কোন শব্দটি Verb?" },
          sentence: "The children play football.",
          sentenceGlosses: [
            { text: "The children", bn: "শিশুরা" },
            { text: "play", bn: "খেলে" },
            { text: "football", bn: "ফুটবল" },
          ],
          options: options(["Children", "শিশুরা"], ["Play", "খেলা"], ["Football", "ফুটবল"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.excellent,
          hint: { en: "What do the children do?", bn: "শিশুরা কী করে?" },
          explanation: {
            en: "“Play” tells us what the children do.",
            bn: "“Play” দিয়ে বোঝা যায় শিশুরা কী করে।",
          },
        },
        {
          id: "q-verb-review-pen",
          prompt: {
            en: "You want to tell someone what you do with a pen. Which Verb can you use?",
            bn: "কলম দিয়ে আপনি কী করেন, তা বোঝাতে কোন Verb ব্যবহার করতে পারেন?",
          },
          options: options(["Sleep", "ঘুমানো"], ["Swim", "সাঁতার কাটা"], ["Write", "লেখা"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.amazing,
          hint: { en: "Pen + paper = ?", bn: "কলম + কাগজ = ?" },
          explanation: { en: "“Write” tells us an action.", bn: "“Write” দিয়ে একটি কাজ বোঝানো হয়।" },
        },
        {
          id: "q-verb-review-tired",
          prompt: { en: "Which English sentence is correct?", bn: "কোন ইংরেজি বাক্যটি সঠিক?" },
          sourceBn: "আমি ক্লান্ত।",
          options: options(["I tired."], ["I am tired."], ["I are tired."]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: { en: "English always needs a Verb.", bn: "ইংরেজিতে Verb লাগবেই।" },
          explanation: { en: "I → am. So: I am tired.", bn: "I → am। তাই: I am tired।" },
        },
        {
          id: "q-verb-review-cook",
          prompt: { en: "Which English sentence is correct?", bn: "কোন ইংরেজি বাক্যটি সঠিক?" },
          sourceBn: "আমরা ভাত রান্না করি।",
          options: options(["We do cook rice."], ["We cook rice."], ["We rice cook."]),
          englishOptions: true,
          correctOptionId: "b",
          praise: { en: "Excellent work, {name}!", bn: "চমৎকার কাজ, {name}!" },
          hint: { en: "রান্না করা is one English word.", bn: "“রান্না করা” ইংরেজিতে একটি শব্দ।" },
          explanation: {
            en: "রান্না করা = cook. No extra “do”, and the Verb comes before the Object.",
            bn: "রান্না করা = cook। বাড়তি “do” লাগবে না, আর Verb বসে Object-এর আগে।",
          },
        },
      ],
    },
  ],
};
