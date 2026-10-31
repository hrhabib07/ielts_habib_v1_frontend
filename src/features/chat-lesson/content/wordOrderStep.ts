import type { ChatLessonStep } from "@/src/features/chat-lesson/types";
// Relative `.ts` import so the Node audio/export scripts can load this file directly.
import { options, PRAISE, table } from "./helpers.ts";

const COL = {
  subject: { en: "Subject", bn: "Subject" },
  verb: { en: "Verb", bn: "Verb" },
  object: { en: "Object", bn: "Object" },
  formula: { en: "Formula", bn: "ফর্মুলা" },
  example: { en: "Example", bn: "উদাহরণ" },
} as const;

const FORMULAS = {
  sv: "Subject + Verb",
  svo: "Subject + Verb + Object",
  sov: "Subject + Object + Verb",
  svpt: "Subject + Verb + Place + Time",
  svopt: "Subject + Verb + Object + Place + Time",
} as const;

/** Word order and sentence formulas, merged into one step. */
export const WORD_ORDER_STEP: ChatLessonStep = {
  id: "level-1-step-9-word-order",
  missionLabel: "Level 1",
  stepLabel: "Lesson 7",
  title: { en: "Crack the Sentence Code", bn: "বাক্যের কোড ভাঙুন" },
  guideName: "Gamlish",
  chunks: [
    {
      id: "same-meaning-different-order",
      title: { en: "Same Meaning, Different Order", bn: "একই অর্থ, ভিন্ন ক্রম" },
      messages: [
        {
          en: "{name}, you already know the **Subject**, **Verb** and **Object**. Now, let's see how their order changes between Bangla and English.",
          bn: "{name}, আপনি ইতোমধ্যে Subject, Verb এবং Object সম্পর্কে শিখেছেন। এবার চলুন দেখি, বাংলা ও ইংরেজি বাক্যে এগুলোর ক্রম কীভাবে আলাদা হয়।",
        },
        {
          en: "First, look at the Bangla sentence. The order is **Subject + Object + Verb**.",
          bn: "প্রথমে বাংলা বাক্যটি দেখুন। এখানে গঠন হলো: Subject + Object + Verb",
          table: table(
            [COL.subject, COL.object, COL.verb],
            [
              ["আমি", "পানি", "পান করি"],
              ["I", "water", "drink"],
            ],
          ),
        },
        {
          variant: "example",
          en: "I drink water.",
          bn: "আমি পানি পান করি।",
          glosses: [
            { text: "I", bn: "আমি" },
            { text: "drink", bn: "পান করি" },
            { text: "water", bn: "পানি" },
          ],
        },
        {
          en: "Now, the English sentence. The order is **Subject + Verb + Object**.",
          bn: "এবার ইংরেজি বাক্যটি দেখুন। এখানে গঠন হলো: Subject + Verb + Object",
          table: table([COL.subject, COL.verb, COL.object], [["I", "drink", "water"]]),
        },
        {
          variant: "remember",
          en: "Remember this code, {name}!\nBangla: **Subject + Object + Verb**\nEnglish: **Subject + Verb + Object**\nIn Bangla, the Object usually comes before the Verb. In simple English sentences like these, the Verb comes before the Object.",
          bn: "{name}, এই কোডটি মনে রাখুন!\nবাংলা: Subject + Object + Verb\nইংরেজি: Subject + Verb + Object\nবাংলা বাক্যে সাধারণত Object, Verb-এর আগে বসে। কিন্তু এই ধরনের সহজ ইংরেজি বাক্যে Verb, Object-এর আগে বসে।",
        },
      ],
      questions: [
        {
          id: "q-order-pattern-rice",
          title: { en: "Crack the Code", bn: "কোডটি ভাঙুন" },
          prompt: {
            en: "Which pattern is correct for this English sentence?",
            bn: "এই ইংরেজি বাক্যটির সঠিক গঠন কোনটি?",
          },
          sentence: "We eat rice.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "eat", bn: "খাই" },
            { text: "rice", bn: "ভাত" },
          ],
          options: options([FORMULAS.sov], [FORMULAS.svo], ["Verb + Subject + Object"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: {
            en: "In English, what comes right after the Subject?",
            bn: "ইংরেজিতে Subject-এর ঠিক পরে কী বসে?",
          },
          explanation: {
            en: "We (Subject), eat (Verb), rice (Object).",
            bn: "We (Subject), eat (Verb), rice (Object)।",
          },
        },
        {
          id: "q-order-build-football",
          title: { en: "Build the English Sentence", bn: "ইংরেজি বাক্যটি তৈরি করুন" },
          prompt: {
            en: "Which English sentence has the correct word order?",
            bn: "কোন ইংরেজি বাক্যটির শব্দের ক্রম সঠিক?",
          },
          sourceBn: "আমরা ফুটবল খেলি।",
          options: options(["We football play."], ["We play football."], ["Football play we."]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: {
            en: "Subject first. Does the Verb or the Object come next?",
            bn: "প্রথমে Subject। এরপর কী বসে, Verb নাকি Object?",
          },
          explanation: {
            en: "You kept the meaning and used the English order: Subject + Verb + Object.",
            bn: "আপনি অর্থ ঠিক রেখে ইংরেজির সঠিক শব্দক্রম ব্যবহার করেছেন: Subject + Verb + Object।",
          },
        },
      ],
    },
    {
      id: "basic-formulas",
      title: { en: "The Basic Formulas", bn: "মূল ফর্মুলাগুলো" },
      messages: [
        {
          en: "A **sentence formula** is a pattern that shows the order of the parts in a sentence. Think of it like a recipe: put the parts in the right order, and you get a correct sentence!",
          bn: "ফর্মুলা হলো একটি নকশা, যা দেখায় বাক্যের অংশগুলো কোন ক্রমে বসবে। এটাকে রান্নার রেসিপির মতো ভাবুন: সঠিক ক্রমে উপকরণ দিলেই সঠিক বাক্য তৈরি হয়!",
        },
        {
          en: "**Formula 1: Subject + Verb**\nThis is the smallest complete sentence.",
          bn: "ফর্মুলা 1: Subject + Verb\nএটি সবচেয়ে ছোট সম্পূর্ণ বাক্য।",
          items: [
            { term: "They sleep.", en: "They (Subject) + sleep (Verb)", bn: "তারা ঘুমায়।" },
            { term: "Birds fly.", en: "Birds (Subject) + fly (Verb)", bn: "পাখিরা ওড়ে।" },
            { term: "The children laugh.", en: "The children (Subject) + laugh (Verb)", bn: "শিশুরা হাসে।" },
          ],
        },
        {
          variant: "remember",
          en: "Every English sentence needs at least a **Subject** and a **Verb**.",
          bn: "প্রতিটি ইংরেজি বাক্যে অন্তত একটি Subject আর একটি Verb থাকতে হয়।",
        },
        {
          en: "**Formula 2: Subject + Verb + Object**\nWhen the action happens to something or someone, add the Object after the Verb.",
          bn: "ফর্মুলা 2: Subject + Verb + Object\nকাজটি যখন কোনো কিছু বা কারও ওপর হয়, তখন Verb-এর পরে Object বসান।",
          items: [
            { term: "I write a letter.", en: "I (Subject) + write (Verb) + a letter (Object)", bn: "আমি একটি চিঠি লিখি।" },
            { term: "We clean the room.", en: "We (Subject) + clean (Verb) + the room (Object)", bn: "আমরা ঘরটি পরিষ্কার করি।" },
            {
              term: "They read the newspaper.",
              en: "They (Subject) + read (Verb) + the newspaper (Object)",
              bn: "তারা পত্রিকা পড়ে।",
            },
          ],
        },
        {
          en: "The Subject or Object can be long, but the formula stays the same.",
          bn: "Subject বা Object লম্বা হতে পারে, কিন্তু ফর্মুলা একই থাকে।",
        },
        {
          variant: "example",
          en: "My brother and I clean the classroom.",
          bn: "আমার ভাই এবং আমি শ্রেণিকক্ষ পরিষ্কার করি।",
          glosses: [
            { text: "My brother", bn: "আমার ভাই" },
            { text: "and", bn: "এবং" },
            { text: "I", bn: "আমি" },
            { text: "clean", bn: "পরিষ্কার করি" },
            { text: "the classroom", bn: "শ্রেণিকক্ষ" },
          ],
        },
      ],
      questions: [
        {
          id: "q-formula-they-sleep",
          title: { en: "Find the Formula", bn: "ফর্মুলাটি খুঁজে বের করুন" },
          prompt: { en: "Which formula does this sentence follow?", bn: "এই বাক্যটি কোন ফর্মুলা মেনে চলে?" },
          sentence: "They sleep.",
          sentenceGlosses: [
            { text: "They", bn: "তারা" },
            { text: "sleep", bn: "ঘুমায়" },
          ],
          options: options([FORMULAS.sv], [FORMULAS.svo], ["Verb + Subject"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: { en: "Is there anything after the Verb “sleep”?", bn: "“sleep” Verb-এর পরে কি আর কিছু আছে?" },
          explanation: {
            en: "“They” is the Subject and “sleep” is the Verb. No Object is needed.",
            bn: "“They” হলো Subject আর “sleep” হলো Verb। এখানে Object লাগে না।",
          },
        },
        {
          id: "q-formula-complete-sentence",
          title: { en: "Spot the Complete Sentence", bn: "সম্পূর্ণ বাক্যটি চিনে নিন" },
          prompt: { en: "Which one is a complete sentence?", bn: "কোনটি সম্পূর্ণ বাক্য?" },
          options: options(["The children."], ["Laugh."], ["The children laugh."]),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Well done, {name}!", bn: "খুব ভালো, {name}!" },
          hint: {
            en: "Find the one that has both a Subject and a Verb.",
            bn: "যেটিতে Subject আর Verb দুটোই আছে, সেটি খুঁজুন।",
          },
          explanation: {
            en: "A complete sentence needs at least a Subject and a Verb.",
            bn: "সম্পূর্ণ বাক্যে অন্তত একটি Subject আর একটি Verb থাকতে হয়।",
          },
        },
        {
          id: "q-formula-arrange-newspaper",
          kind: "arrange",
          title: { en: "Build the Sentence", bn: "বাক্যটি তৈরি করুন" },
          prompt: { en: "Tap the pieces in the right order.", bn: "টুকরোগুলো সঠিক ক্রমে ট্যাপ করুন।" },
          sourceBn: "তারা পত্রিকা পড়ে।",
          options: options(["the newspaper"], ["They"], ["read"]),
          correctOptionId: "b c a",
          praise: PRAISE.excellent,
          hint: {
            en: "Subject first. Then the action. The Object goes last.",
            bn: "প্রথমে Subject। তারপর কাজ। Object বসে সবশেষে।",
          },
          explanation: {
            en: "Subject + Verb + Object. In English, “read” comes before “the newspaper”.",
            bn: "Subject + Verb + Object। ইংরেজিতে “read” বসে “the newspaper”-এর আগে।",
          },
        },
        {
          id: "q-formula-long-subject",
          title: { en: "Long Subject, Same Formula", bn: "লম্বা Subject, একই ফর্মুলা" },
          prompt: { en: "Which formula does this sentence follow?", bn: "এই বাক্যটি কোন ফর্মুলা মেনে চলে?" },
          sentence: "My brother and I clean the classroom.",
          sentenceGlosses: [
            { text: "My brother", bn: "আমার ভাই" },
            { text: "and", bn: "এবং" },
            { text: "I", bn: "আমি" },
            { text: "clean", bn: "পরিষ্কার করি" },
            { text: "the classroom", bn: "শ্রেণিকক্ষ" },
          ],
          options: options([FORMULAS.sv], [FORMULAS.svo], [FORMULAS.sov]),
          englishOptions: true,
          correctOptionId: "b",
          praise: { en: "Great thinking!", bn: "দারুণ!" },
          hint: {
            en: "The Subject has several words. What do they clean?",
            bn: "Subject-এ কয়েকটি শব্দ আছে। তারা কী পরিষ্কার করে?",
          },
          explanation: {
            en: "“My brother and I” is one Subject, “clean” is the Verb and “the classroom” is the Object.",
            bn: "“My brother and I” হলো একটি Subject, “clean” হলো Verb আর “the classroom” হলো Object।",
          },
        },
      ],
    },
    {
      id: "place-and-time",
      title: { en: "Add Place and Time", bn: "স্থান ও সময় যোগ করুন" },
      messages: [
        {
          en: "Start with a simple sentence, then add details to make it longer.",
          bn: "একটি সহজ বাক্য দিয়ে শুরু করুন, তারপর তথ্য যোগ করে বাক্যটি বড় করুন।",
          items: [
            {
              term: "Start",
              termBn: "শুরু",
              en: "We play football.",
              bn: "We play football. (আমরা ফুটবল খেলি।)",
            },
            {
              term: "Add a place",
              termBn: "স্থান যোগ করুন",
              en: "We play football in the field.",
              bn: "We play football in the field. (আমরা মাঠে ফুটবল খেলি।)",
            },
            {
              term: "Add a time",
              termBn: "সময় যোগ করুন",
              en: "We play football in the field after class.",
              bn: "We play football in the field after class. (আমরা ক্লাসের পর মাঠে ফুটবল খেলি।)",
            },
          ],
        },
        {
          en: "**in the field** tells us **where**. That is the place.\n**after class** tells us **when**. That is the time.",
          bn: "in the field বলে কোথায়। এটি হলো স্থান।\nafter class বলে কখন। এটি হলো সময়।",
        },
        {
          variant: "remember",
          en: "In English, the **place** comes first, then the **time**.\nBangla often says the time first, so watch out!\nBangla: ক্লাসের পর মাঠে\nEnglish: in the field after class",
          bn: "ইংরেজিতে আগে স্থান, তারপর সময়।\nবাংলায় অনেক সময় আগে সময়টা বলা হয়, তাই খেয়াল রাখুন!\nবাংলা: ক্লাসের পর মাঠে\nইংরেজি: in the field after class",
        },
        {
          en: "Some Verbs do not need an Object. Then the place and the time come right after the Verb.\n**Formula 3: Subject + Verb + Place + Time**",
          bn: "কিছু Verb-এর Object লাগে না। তখন Verb-এর ঠিক পরেই স্থান ও সময় বসে।\nফর্মুলা 3: Subject + Verb + Place + Time",
        },
        {
          variant: "example",
          en: "They run in the park in the morning.",
          bn: "তারা সকালে পার্কে দৌড়ায়।",
          glosses: [
            { text: "They", bn: "তারা" },
            { text: "run", bn: "দৌড়ায়" },
            { text: "in the park", bn: "পার্কে" },
            { text: "in the morning", bn: "সকালে" },
          ],
        },
        {
          en: "With an Object, the place and the time come after the Object.\n**Formula 4: Subject + Verb + Object + Place + Time**\nWe play football in the field after class.",
          bn: "Object থাকলে স্থান ও সময় বসে Object-এর পরে।\nফর্মুলা 4: Subject + Verb + Object + Place + Time\nWe play football in the field after class.",
        },
      ],
      questions: [
        {
          id: "q-order-find-place",
          title: { en: "Find the Place", bn: "স্থানটি খুঁজে বের করুন" },
          prompt: {
            en: "Which phrase tells us where the action happens?",
            bn: "কোন শব্দগুচ্ছটি কাজটি কোথায় ঘটে, সেই তথ্য দেয়?",
          },
          sentence: "We read books in the library after class.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "read", bn: "পড়ি" },
            { text: "books", bn: "বই" },
            { text: "in the library", bn: "লাইব্রেরিতে" },
            { text: "after class", bn: "ক্লাসের পর" },
          ],
          options: options(["after class", "ক্লাসের পর"], ["in the library", "লাইব্রেরিতে"], ["read books", "বই পড়ি"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "Ask “where?” Where do we read books?", bn: "“কোথায়?” প্রশ্ন করুন। আমরা কোথায় বই পড়ি?" },
          explanation: {
            en: "“In the library” tells us the place. “After class” tells us the time.",
            bn: "“in the library” স্থান বোঝায়। আর “after class” সময় বোঝায়।",
          },
        },
        {
          id: "q-order-after-class",
          title: { en: "Add a Time Detail", bn: "সময়ের তথ্য যোগ করুন" },
          prompt: { en: "Complete the sentence.", bn: "বাক্যটি সম্পূর্ণ করুন।" },
          sourceBn: "আমরা ক্লাসের পর ফুটবল খেলি।",
          sentence: "We play football ______.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "play", bn: "খেলি" },
            { text: "football", bn: "ফুটবল" },
          ],
          options: options(
            ["after class", "ক্লাসের পর"],
            ["football after", "ফুটবলের পরে"],
            ["play after class", "ক্লাসের পর খেলি"],
          ),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.great,
          hint: {
            en: "“We play football” is already there. Which piece adds only the time?",
            bn: "“We play football” তো আছেই। কোন অংশটি শুধু সময় যোগ করে?",
          },
          explanation: {
            en: "“After class” tells us when we play.",
            bn: "“after class” আমরা কখন খেলি, সেই তথ্য দেয়।",
          },
        },
        {
          id: "q-formula-no-object",
          title: { en: "No Object? No Problem!", bn: "Object নেই? সমস্যা নেই!" },
          prompt: { en: "Which formula does this sentence follow?", bn: "এই বাক্যটি কোন ফর্মুলা মেনে চলে?" },
          sentence: "They run in the park in the morning.",
          sentenceGlosses: [
            { text: "They", bn: "তারা" },
            { text: "run", bn: "দৌড়ায়" },
            { text: "in the park", bn: "পার্কে" },
            { text: "in the morning", bn: "সকালে" },
          ],
          options: options([FORMULAS.svopt], [FORMULAS.svpt], ["Subject + Verb + Time + Place"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "Ask “what?” after “run”. Is there an answer?", bn: "“run”-এর পরে “কী?” প্রশ্ন করুন। কোনো উত্তর আছে কি?" },
          explanation: {
            en: "“Run” has no Object here. “In the park” is the place and “in the morning” is the time.",
            bn: "এখানে “run”-এর কোনো Object নেই। “in the park” হলো স্থান আর “in the morning” হলো সময়।",
          },
        },
        {
          id: "q-order-arrange-afternoon",
          kind: "arrange",
          title: { en: "Unlock the Correct Sentence", bn: "সঠিক বাক্যটি আনলক করুন" },
          prompt: { en: "Tap the pieces in the right order.", bn: "টুকরোগুলো সঠিক ক্রমে ট্যাপ করুন।" },
          sourceBn: "আমরা বিকেলে মাঠে ফুটবল খেলি।",
          options: options(["in the field"], ["We"], ["in the afternoon"], ["play football"]),
          correctOptionId: "b d a c",
          praise: PRAISE.excellent,
          hint: {
            en: "Subject first, then Verb and Object. After that, the place. The time goes last.",
            bn: "প্রথমে Subject, তারপর Verb ও Object। এরপর স্থান। সময় বসে সবশেষে।",
          },
          explanation: {
            en: "The basic order stays the same, and the details come after it: place first, then time.",
            bn: "বাক্যের মূল গঠন ঠিক আছে, আর বাড়তি তথ্য পরে বসেছে: আগে স্থান, তারপর সময়।",
          },
        },
      ],
    },
    {
      id: "type-it-yourself",
      title: { en: "Type It Yourself", bn: "নিজে লিখুন" },
      messages: [
        {
          en: "{name}, you know the formulas. Now write the English sentence **yourself**!",
          bn: "{name}, আপনি ফর্মুলাগুলো জানেন। এবার নিজেই ইংরেজি বাক্যটি লিখুন!",
        },
        {
          variant: "remember",
          en: "Subject, then Verb, then Object. After that, the place, then the time. Capital letters and the full stop don't matter. Spelling does.",
          bn: "প্রথমে Subject, তারপর Verb, তারপর Object। এরপর স্থান, তারপর সময়। বড় হাতের অক্ষর বা দাঁড়ি নিয়ে চিন্তা নেই, তবে বানান ঠিক হতে হবে।",
        },
      ],
      questions: [
        {
          id: "q-type-drink-water",
          kind: "type",
          title: { en: "Write It in English", bn: "ইংরেজিতে লিখুন" },
          prompt: { en: "Type this sentence in English.", bn: "বাক্যটি ইংরেজিতে লিখুন।" },
          sourceBn: "আমরা পানি পান করি।",
          options: options(["We drink water."]),
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: {
            en: "Subject + Verb + Object. পান করা is one word: drink.",
            bn: "Subject + Verb + Object। পান করা মানে একটি শব্দ: drink।",
          },
          explanation: {
            en: "We (Subject) drink (Verb) water (Object).",
            bn: "We (Subject) drink (Verb) water (Object)।",
          },
        },
        {
          id: "q-type-go-school",
          kind: "type",
          title: { en: "Add a Place and a Time", bn: "স্থান ও সময় যোগ করুন" },
          prompt: { en: "Type this sentence in English.", bn: "বাক্যটি ইংরেজিতে লিখুন।" },
          sourceBn: "আমি সকালে স্কুলে যাই।",
          options: options(["I go to school in the morning."], ["In the morning, I go to school."]),
          correctOptionId: "a",
          praise: { en: "Great, {name}!", bn: "দারুণ, {name}!" },
          hint: {
            en: "Subject + Verb, then the place (to school), then the time (in the morning).",
            bn: "Subject + Verb, তারপর স্থান (to school), তারপর সময় (in the morning)।",
          },
          explanation: {
            en: "I go to school in the morning. Place first, then time.",
            bn: "I go to school in the morning। আগে স্থান, তারপর সময়।",
          },
        },
        {
          id: "q-type-play-football",
          kind: "type",
          title: { en: "The Full Formula", bn: "পুরো ফর্মুলা" },
          prompt: { en: "Type this sentence in English.", bn: "বাক্যটি ইংরেজিতে লিখুন।" },
          sourceBn: "তারা বিকেলে মাঠে ফুটবল খেলে।",
          options: options(
            ["They play football in the field in the afternoon."],
            ["In the afternoon, they play football in the field."],
          ),
          correctOptionId: "a",
          praise: PRAISE.excellent,
          hint: {
            en: "Subject, Verb, Object, then the place (in the field), then the time (in the afternoon).",
            bn: "Subject, Verb, Object, তারপর স্থান (in the field), তারপর সময় (in the afternoon)।",
          },
          explanation: {
            en: "They play football in the field in the afternoon. Subject + Verb + Object + Place + Time.",
            bn: "They play football in the field in the afternoon। Subject + Verb + Object + Place + Time।",
          },
        },
      ],
    },
    {
      id: "formula-master",
      title: { en: "Formula Master", bn: "ফর্মুলা মাস্টার" },
      messages: [
        {
          en: "Here is your **formula card**, {name}.",
          bn: "{name}, এটি আপনার ফর্মুলা কার্ড।",
          table: table(
            [COL.formula, COL.example],
            [
              [FORMULAS.sv, "They sleep."],
              [FORMULAS.svo, "We play football."],
              [FORMULAS.svpt, "They run in the park in the morning."],
              [FORMULAS.svopt, "We play football in the field after class."],
            ],
          ),
        },
        {
          variant: "remember",
          en: "Before you build a sentence, ask: Who is the Subject? What is the Verb? Is there an Object? Is there a place or a time? Then follow the formula.",
          bn: "বাক্য বানানোর আগে নিজেকে প্রশ্ন করুন: Subject কে? Verb কী? Object আছে কি? স্থান বা সময় আছে কি? তারপর ফর্মুলা অনুযায়ী সাজান।",
        },
      ],
      questions: [
        {
          id: "q-order-fix-breakfast",
          title: { en: "Fix the Sentence", bn: "বাক্যটি ঠিক করুন" },
          prompt: { en: "Choose the correct English sentence.", bn: "সঠিক ইংরেজি বাক্যটি বেছে নিন।" },
          sourceBn: "আমরা সকালে বাড়িতে নাশতা খাই।",
          options: options(
            ["We breakfast eat at home in the morning."],
            ["We eat breakfast at home in the morning."],
            ["We at home in the morning breakfast eat."],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: {
            en: "Subject, then Verb, then Object. Place and time come last.",
            bn: "Subject, তারপর Verb, তারপর Object। স্থান আর সময় বসে সবশেষে।",
          },
          explanation: {
            en: "Subject, then Verb, then Object and the details. Notice: Bangla says the time first (সকালে বাড়িতে), but English puts the place first (at home in the morning).",
            bn: "প্রথমে Subject, তারপর Verb, এরপর Object ও অন্যান্য তথ্য। খেয়াল করুন: বাংলায় আগে সময় বলা হয় (সকালে বাড়িতে), কিন্তু ইংরেজিতে আগে স্থান বসে (at home in the morning)।",
          },
        },
        {
          id: "q-formula-place-first",
          title: { en: "Where Does the Place Go?", bn: "স্থান কোথায় বসে?" },
          prompt: {
            en: "Which sentence follows Subject + Verb + Object + Place + Time?",
            bn: "কোন বাক্যটি Subject + Verb + Object + Place + Time মেনে চলে?",
          },
          options: options(
            ["I read books after school in the library."],
            ["I read books in the library after school."],
            ["I in the library read books after school."],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: { en: "Well done!", bn: "খুব ভালো!" },
          hint: { en: "Place first, then time.", bn: "আগে স্থান, তারপর সময়।" },
          explanation: {
            en: "“In the library” (place) comes before “after school” (time).",
            bn: "“in the library” (স্থান) বসেছে “after school” (সময়)-এর আগে।",
          },
        },
        {
          id: "q-formula-match-sleep",
          title: { en: "Match the Pattern", bn: "নকশাটি মিলিয়ে নিন" },
          prompt: { en: "Which formula does this sentence follow?", bn: "এই বাক্যটি কোন ফর্মুলা মেনে চলে?" },
          sentence: "I sleep in my room at night.",
          sentenceGlosses: [
            { text: "I", bn: "আমি" },
            { text: "sleep", bn: "ঘুমাই" },
            { text: "in my room", bn: "আমার ঘরে" },
            { text: "at night", bn: "রাতে" },
          ],
          options: options([FORMULAS.sv], [FORMULAS.svpt], ["Subject + Verb + Object + Time"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.excellent,
          hint: { en: "Is “in my room” an Object, or a place?", bn: "“in my room” কি Object, নাকি স্থান?" },
          explanation: {
            en: "“Sleep” has no Object. “In my room” is the place and “at night” is the time.",
            bn: "“sleep”-এর কোনো Object নেই। “in my room” হলো স্থান আর “at night” হলো সময়।",
          },
        },
        {
          id: "q-formula-arrange-lunch",
          kind: "arrange",
          title: { en: "The Final Formula Challenge", bn: "চূড়ান্ত ফর্মুলা চ্যালেঞ্জ" },
          prompt: { en: "Tap the pieces in the right order.", bn: "টুকরোগুলো সঠিক ক্রমে ট্যাপ করুন।" },
          sourceBn: "আমরা দুপুরে স্কুলে টিফিন খাই।",
          options: options(["at noon"], ["We"], ["at school"], ["eat lunch"]),
          correctOptionId: "b d c a",
          praise: { en: "Formula mastered!", bn: "ফর্মুলা আয়ত্ত হয়েছে!" },
          hint: {
            en: "Subject, then Verb and Object, then place, then time.",
            bn: "Subject, তারপর Verb ও Object, তারপর স্থান, তারপর সময়।",
          },
          explanation: {
            en: "We eat lunch at school at noon. Subject + Verb + Object + Place + Time.",
            bn: "We eat lunch at school at noon. Subject + Verb + Object + Place + Time।",
          },
        },
      ],
    },
    {
      id: "word-order-complete",
      title: { en: "Mission Complete!", bn: "মিশন সম্পন্ন!" },
      messages: [
        {
          en: "You cracked the sentence code, {name}! You know how English order differs from Bangla, and you can use **4 sentence formulas** to build correct sentences.",
          bn: "{name}, আপনি বাক্যের কোড ভেঙে ফেলেছেন! আপনি জানেন ইংরেজির ক্রম বাংলা থেকে কীভাবে আলাদা, আর 4টি ফর্মুলা দিয়ে সঠিক বাক্য তৈরি করতে পারেন।",
        },
        {
          en: "Next up: the **Word Order Playground**, then the **Mission 1 Final Test**.",
          bn: "এরপর: Word Order প্লেগ্রাউন্ড, তারপর মিশন 1 ফাইনাল টেস্ট।",
        },
      ],
      questions: [],
    },
  ],
};
