import type { ChatLessonStep, LessonOption } from "@/src/features/chat-lesson/types";
// Relative `.ts` import so the Node audio/export scripts can load this file directly.
import { COLUMNS, LETS_TEST, options, PRAISE, table } from "./helpers.ts";
import { DECODE_PRONOUNS_CHUNK } from "./numberPersonStep.ts";

const PERSONS = (order: ("first" | "second" | "third")[]): LessonOption[] => {
  const all = {
    first: ["First Person", "প্রথম পুরুষ"],
    second: ["Second Person", "দ্বিতীয় পুরুষ"],
    third: ["Third Person", "তৃতীয় পুরুষ"],
  } as const;
  return options(...order.map((key) => [all[key][0], all[key][1]] as [string, string]));
};

export const PERSON_STEP: ChatLessonStep = {
  id: "level-1-step-5-person",
  missionLabel: "Level 1",
  stepLabel: "Lesson 4",
  title: { en: "Person", bn: "পারসন" },
  teacherNote:
    "Bangla traps first: সে becomes He or She, and আপনি, তুমি, তুই all become You. Teach the mixed-Subject rule (I first, then You) before the review.",
  guideName: "Gamlish",
  chunks: [
    {
      id: "what-is-person",
      title: { en: "What is Person?", bn: "Person কী?" },
      messages: [
        {
          en: "{name}, we know that the **Subject** tells us who or what a sentence is about, and **Number** tells us if it is one or more than one.",
          bn: "{name}, আমরা জানি, Subject আমাদের জানায় বাক্যে কার সম্পর্কে বা কী সম্পর্কে বলা হচ্ছে। Number আমাদের জানায়, Subject একজন বা একাধিক ব্যক্তি কিংবা বস্তুকে বোঝায়।",
        },
        {
          en: "Now, let's learn **Person**. Person helps us understand **who is speaking**, **who is being spoken to**, or **who or what is being talked about**.",
          bn: "এখন শিখব Person। Person আমাদের বুঝতে সাহায্য করে কে কথা বলছে, কাকে উদ্দেশ্য করে কথা বলা হচ্ছে, অথবা কার বা কী সম্পর্কে কথা বলা হচ্ছে।",
        },
        {
          variant: "example",
          en: "I learn English.",
          bn: "আমি ইংরেজি শিখি।",
          glosses: [
            { text: "I", bn: "আমি" },
            { text: "learn", bn: "শিখি" },
            { text: "English", bn: "ইংরেজি" },
          ],
        },
        {
          en: "Subject: **I**\nPerson: the speaker",
          bn: "Subject: I (আমি)\nPerson: যে কথা বলছে",
        },
        {
          variant: "example",
          en: "You learn English.",
          bn: "তুমি ইংরেজি শেখো।",
          glosses: [
            { text: "You", bn: "তুমি" },
            { text: "learn", bn: "শেখো" },
            { text: "English", bn: "ইংরেজি" },
          ],
        },
        {
          en: "Subject: **You**\nPerson: the person being spoken to",
          bn: "Subject: You (তুমি)\nPerson: যাকে উদ্দেশ্য করে কথা বলা হচ্ছে",
        },
        {
          variant: "example",
          en: "Rahim learns English.",
          bn: "রহিম ইংরেজি শেখে।",
          glosses: [
            { text: "Rahim", bn: "রহিম" },
            { text: "learns", bn: "শেখে" },
            { text: "English", bn: "ইংরেজি" },
          ],
        },
        {
          en: "Subject: **Rahim**\nPerson: the person being talked about",
          bn: "Subject: Rahim (রহিম)\nPerson: যার সম্পর্কে কথা বলা হচ্ছে",
        },
        {
          en: "In English grammar, these differences are called **Person**.",
          bn: "ইংরেজি গ্রামারে এই পার্থক্যগুলোকে Person বলা হয়।",
        },
        {
          variant: "remember",
          en: "**I** = the speaker\n**You** = the person being spoken to\n**Rahim** = the person being talked about",
          bn: "I = যে কথা বলছে\nYou = যাকে উদ্দেশ্য করে কথা বলা হচ্ছে\nRahim = যার সম্পর্কে কথা বলা হচ্ছে",
        },
      ],
      questions: [
        {
          id: "q-person-who-speaks",
          prompt: {
            en: "In “I play football,” who is speaking?",
            bn: "“I play football.” (আমি ফুটবল খেলি।) বাক্যটিতে কে কথা বলছে?",
          },
          options: options(["I", "আমি"], ["You", "তুমি"], ["Rahim", "রহিম"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: { en: "Correct, {name}!", bn: "সঠিক, {name}!" },
          hint: {
            en: "When you talk about yourself, which word do you use?",
            bn: "নিজের কথা বলতে আপনি কোন শব্দটা ব্যবহার করেন?",
          },
          explanation: {
            en: "“I” refers to the speaker.",
            bn: "“I” বলতে যে কথা বলছে, তাকে বোঝায়।",
          },
        },
        {
          id: "q-person-spoken-to",
          prompt: {
            en: "In “You learn English,” who is being spoken to?",
            bn: "“You learn English.” (তুমি ইংরেজি শেখো।) বাক্যটিতে কাকে উদ্দেশ্য করে কথা বলা হচ্ছে?",
          },
          options: options(["The speaker", "যে কথা বলছে"], ["You", "তুমি"], ["Rahim", "রহিম"]),
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: {
            en: "When someone says “you”, who are they talking to?",
            bn: "কেউ “you” বললে, সে কার সঙ্গে কথা বলছে?",
          },
          explanation: {
            en: "“You” refers to the person being spoken to.",
            bn: "“You” বলতে যাকে উদ্দেশ্য করে কথা বলা হচ্ছে, তাকে বোঝায়।",
          },
        },
        {
          id: "q-person-talked-about",
          prompt: {
            en: "In “Rahim plays football,” who is being talked about?",
            bn: "“Rahim plays football.” (রহিম ফুটবল খেলে।) বাক্যটিতে কার সম্পর্কে কথা বলা হচ্ছে?",
          },
          options: options(["I", "আমি"], ["You", "তুমি"], ["Rahim", "রহিম"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: { en: "Whose name is in the sentence?", bn: "বাক্যে কার নাম আছে?" },
          explanation: {
            en: "The sentence is about Rahim.",
            bn: "বাক্যটিতে রহিমের সম্পর্কে বলা হচ্ছে।",
          },
        },
      ],
    },
    {
      id: "three-persons",
      title: { en: "First, Second and Third Person", bn: "First, Second এবং Third Person" },
      messages: [
        {
          en: "In English grammar, Person has **three** types.",
          bn: "ইংরেজি গ্রামারে Person তিন প্রকার।",
        },
        {
          en: "**First Person**: the person speaking.",
          bn: "First Person: যে কথা বলছে।",
          table: table(
            [COLUMNS.english, COLUMNS.bangla],
            [
              ["I", "আমি"],
              ["We", "আমরা"],
            ],
          ),
        },
        {
          en: "**Second Person**: the person being spoken to.",
          bn: "Second Person: যাকে উদ্দেশ্য করে কথা বলা হচ্ছে।",
          table: table([COLUMNS.english, COLUMNS.bangla], [["You", "তুমি / তোমরা"]]),
        },
        {
          en: "**Third Person**: the person or thing being talked about.",
          bn: "Third Person: যে ব্যক্তি বা বস্তু সম্পর্কে কথা বলা হচ্ছে।",
          table: table(
            [COLUMNS.english, COLUMNS.bangla],
            [
              ["He", "সে"],
              ["She", "সে"],
              ["It", "এটি"],
              ["They", "তারা"],
              ["Rahim", "রহিম"],
              ["The students", "শিক্ষার্থীরা"],
            ],
          ),
        },
        {
          variant: "remember",
          en: "**First Person** = the speaker\n**Second Person** = the person being spoken to\n**Third Person** = the person or thing being talked about",
          bn: "First Person = যে কথা বলছে\nSecond Person = যাকে উদ্দেশ্য করে কথা বলা হচ্ছে\nThird Person = যে ব্যক্তি বা বস্তু সম্পর্কে কথা বলা হচ্ছে",
        },
      ],
      questions: [
        {
          id: "q-person-first",
          prompt: { en: "Which Subject is First Person?", bn: "কোন Subject-টি First Person?" },
          options: options(["You", "তুমি"], ["They", "তারা"], ["We", "আমরা"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: {
            en: "First Person includes the speaker. Which word includes “me”?",
            bn: "First Person-এ বক্তা নিজে থাকে। কোন শব্দে “আমি”-ও আছে?",
          },
          explanation: {
            en: "“We” includes the speaker.",
            bn: "“We” বলতে যে কথা বলছে, সে নিজেও অন্তর্ভুক্ত থাকে।",
          },
        },
        {
          id: "q-person-second",
          prompt: { en: "Which Subject is Second Person?", bn: "কোন Subject-টি Second Person?" },
          options: options(["I", "আমি"], ["You", "তুমি"], ["He", "সে"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "Second Person is the one you talk to.", bn: "Second Person হলো যার সঙ্গে আপনি কথা বলেন।" },
          explanation: {
            en: "“You” refers to the person being spoken to.",
            bn: "“You” বলতে যাকে উদ্দেশ্য করে কথা বলা হচ্ছে, তাকে বোঝায়।",
          },
        },
        {
          id: "q-person-third",
          prompt: { en: "Which Subject is Third Person?", bn: "কোন Subject-টি Third Person?" },
          options: options(["I", "আমি"], ["We", "আমরা"], ["They", "তারা"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: {
            en: "Third Person is someone you talk about. Not you, not me.",
            bn: "Third Person হলো যাদের নিয়ে কথা হয়। আপনি বা আমি নয়।",
          },
          explanation: {
            en: "“They” refers to people being talked about.",
            bn: "“They” বলতে যাদের সম্পর্কে কথা বলা হচ্ছে, তাদের বোঝায়।",
          },
        },
      ],
    },
    {
      id: "he-she-it-they",
      title: { en: "He, She, It, They", bn: "He, She, It, They" },
      messages: [
        {
          en: "{name}, in Bangla, we say “সে” for a boy and for a girl. English is different. It has two words: **He** and **She**.",
          bn: "{name}, বাংলায় ছেলে আর মেয়ে দুজনের জন্যই আমরা “সে” বলি। কিন্তু ইংরেজিতে দুটি আলাদা শব্দ আছে: He এবং She।",
          table: table(
            [COLUMNS.english, { en: "When to use", bn: "কখন ব্যবহার করবেন" }],
            [
              ["He", { en: "one boy or man", bn: "সে (একজন ছেলে বা পুরুষ)" }],
              ["She", { en: "one girl or woman", bn: "সে (একজন মেয়ে বা মহিলা)" }],
              ["It", { en: "one thing or animal", bn: "এটি / সেটি (একটি বস্তু বা প্রাণী)" }],
              ["They", { en: "more than one person or thing", bn: "তারা / সেগুলো (একাধিক ব্যক্তি বা বস্তু)" }],
            ],
          ),
        },
        {
          variant: "example",
          en: "Rafi is my friend. He is in Class 7.",
          bn: "রাফি আমার বন্ধু। সে সপ্তম শ্রেণিতে পড়ে।",
          glosses: [
            { text: "Rafi", bn: "রাফি" },
            { text: "my friend", bn: "আমার বন্ধু" },
            { text: "He", bn: "সে (ছেলে)" },
            { text: "in Class 7", bn: "সপ্তম শ্রেণিতে" },
          ],
        },
        {
          variant: "example",
          en: "Mina is my sister. She is in Class 5.",
          bn: "মিনা আমার বোন। সে পঞ্চম শ্রেণিতে পড়ে।",
          glosses: [
            { text: "Mina", bn: "মিনা" },
            { text: "my sister", bn: "আমার বোন" },
            { text: "She", bn: "সে (মেয়ে)" },
            { text: "in Class 5", bn: "পঞ্চম শ্রেণিতে" },
          ],
        },
        {
          variant: "example",
          en: "The fan is old. It is noisy.",
          bn: "ফ্যানটি পুরোনো। এটি শব্দ করে।",
          glosses: [
            { text: "The fan", bn: "ফ্যানটি" },
            { text: "old", bn: "পুরোনো" },
            { text: "It", bn: "এটি" },
            { text: "noisy", bn: "শব্দ করে এমন" },
          ],
        },
        {
          variant: "example",
          en: "My shoes are new. They are black.",
          bn: "আমার জুতাগুলো নতুন। সেগুলো কালো।",
          glosses: [
            { text: "My shoes", bn: "আমার জুতাগুলো" },
            { text: "new", bn: "নতুন" },
            { text: "They", bn: "সেগুলো" },
            { text: "black", bn: "কালো" },
          ],
        },
        {
          variant: "remember",
          en: "Boy or man → **He**\nGirl or woman → **She**\nOne thing or animal → **It**\nMore than one → **They**\nAll four are **Third Person**.",
          bn: "ছেলে বা পুরুষ → He\nমেয়ে বা মহিলা → She\nএকটি বস্তু বা প্রাণী → It\nএকাধিক → They\nচারটিই Third Person।",
        },
      ],
      questions: [
        {
          id: "q-person-she-mother",
          prompt: {
            en: "My mother is a teacher. ___ is very kind.",
            bn: "My mother is a teacher. ___ is very kind. (আমার মা একজন শিক্ষক। সে খুব দয়ালু।) শূন্যস্থানে কোনটি বসবে?",
          },
          options: options(["He"], ["She"], ["It"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "Is a mother a man or a woman?", bn: "মা কি পুরুষ, নাকি মহিলা?" },
          explanation: {
            en: "A mother is a woman, so we use “She”. Bangla says সে, but English says She.",
            bn: "মা একজন মহিলা, তাই “She”। বাংলায় “সে” বলি, কিন্তু ইংরেজিতে She।",
          },
        },
        {
          id: "q-person-it-bag",
          prompt: {
            en: "The bag is heavy. ___ is full of books.",
            bn: "The bag is heavy. ___ is full of books. (ব্যাগটি ভারী। এটি বইয়ে ভরা।) শূন্যস্থানে কোনটি বসবে?",
          },
          options: options(["He"], ["It"], ["They"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "A bag is one thing.", bn: "ব্যাগ একটি বস্তু।" },
          explanation: { en: "One thing is “It”.", bn: "একটি বস্তুর জন্য “It” বসে।" },
        },
        {
          id: "q-person-he-uncle",
          prompt: {
            en: "My uncle lives in Sylhet. ___ is a farmer.",
            bn: "My uncle lives in Sylhet. ___ is a farmer. (আমার চাচা সিলেটে থাকেন। তিনি একজন কৃষক।) শূন্যস্থানে কোনটি বসবে?",
          },
          options: options(["She"], ["He"], ["It"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: { en: "Is an uncle a man or a woman?", bn: "চাচা কি পুরুষ, নাকি মহিলা?" },
          explanation: { en: "An uncle is a man, so we use “He”.", bn: "চাচা একজন পুরুষ, তাই “He”।" },
        },
        {
          id: "q-person-they-mangoes",
          prompt: {
            en: "The mangoes are ripe. ___ are sweet.",
            bn: "The mangoes are ripe. ___ are sweet. (আমগুলো পাকা। সেগুলো মিষ্টি।) শূন্যস্থানে কোনটি বসবে?",
          },
          options: options(["It"], ["They"], ["He"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.excellent,
          hint: { en: "One mango, or many mangoes?", bn: "একটি আম, নাকি অনেকগুলো?" },
          explanation: {
            en: "More than one thing is “They”, not “It”.",
            bn: "একাধিক বস্তুর জন্য “They” বসে, “It” নয়।",
          },
        },
      ],
    },
    {
      id: "you-for-all",
      title: { en: "আপনি, তুমি, তুই: All Are You", bn: "আপনি, তুমি, তুই: সবই You" },
      messages: [
        {
          en: "Bangla has three ways to talk to someone: আপনি, তুমি and তুই. English has only **one** word for all of them: **You**.",
          bn: "বাংলায় কাউকে উদ্দেশ্য করে বলার তিনটি শব্দ আছে: আপনি, তুমি, তুই। ইংরেজিতে তিনটির জন্যই একটি শব্দ: You।",
          table: table(
            [COLUMNS.bangla, COLUMNS.english],
            [
              ["আপনি / তুমি / তুই", "You"],
              ["আপনারা / তোমরা / তোরা", "You"],
              ["সে / তিনি / উনি", { en: "He or She", bn: "He অথবা She" }],
            ],
          ),
        },
        {
          en: "Respect does not change the English word. In English, we show respect with polite words like **please** and **thank you**.",
          bn: "সম্মান দেখাতে ইংরেজিতে শব্দ বদলায় না। ইংরেজিতে সম্মান দেখানো হয় please, thank you-এর মতো ভদ্র শব্দ দিয়ে।",
        },
        {
          variant: "example",
          en: "Grandfather, how are you?",
          bn: "দাদা, আপনি কেমন আছেন?",
          glosses: [
            { text: "Grandfather", bn: "দাদা" },
            { text: "how", bn: "কেমন" },
            { text: "are", bn: "আছেন" },
            { text: "you", bn: "আপনি" },
          ],
        },
        {
          variant: "example",
          en: "He is our head teacher.",
          bn: "তিনি আমাদের প্রধান শিক্ষক।",
          glosses: [
            { text: "He", bn: "তিনি" },
            { text: "our head teacher", bn: "আমাদের প্রধান শিক্ষক" },
          ],
        },
        {
          variant: "remember",
          en: "আপনি, তুমি, তুই = **You**. One person or many, with respect or without, it is always **You**, always **Second Person**.",
          bn: "আপনি, তুমি, তুই = You। একজন হোক বা অনেকজন, সম্মান দিয়ে হোক বা না হোক, সবসময় You, সবসময় Second Person।",
        },
      ],
      questions: [
        {
          id: "q-person-apni",
          prompt: {
            en: "“আপনি কি ডাক্তার?” What is the Subject in English?",
            bn: "“আপনি কি ডাক্তার?” ইংরেজিতে Subject কোনটি হবে?",
          },
          options: options(["You"], ["He"], ["I"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: {
            en: "আপনি is the person you are talking to.",
            bn: "আপনি মানে যার সঙ্গে কথা বলছেন, সে।",
          },
          explanation: {
            en: "আপনি, তুমি and তুই are all “You” in English.",
            bn: "আপনি, তুমি, তুই সবগুলোই ইংরেজিতে “You”।",
          },
        },
        {
          id: "q-person-tini-dadi",
          prompt: {
            en: "“তিনি আমার দাদি।” Which word is the Subject in English?",
            bn: "“তিনি আমার দাদি।” ইংরেজিতে Subject কোনটি হবে?",
          },
          options: options(["He"], ["She"], ["You"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: { en: "Is a grandmother a man or a woman?", bn: "দাদি কি পুরুষ, নাকি মহিলা?" },
          explanation: {
            en: "তিনি is respect, but the English word depends on the person. A grandmother is “She”.",
            bn: "তিনি সম্মানসূচক, কিন্তু ইংরেজি শব্দটি নির্ভর করে মানুষটির ওপর। দাদি হলে “She”।",
          },
        },
        {
          id: "q-person-tora",
          prompt: {
            en: "“তোরা কোথায়?” What is the Subject in English?",
            bn: "“তোরা কোথায়?” ইংরেজিতে Subject কোনটি হবে?",
          },
          options: options(["They"], ["You"], ["We"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: { en: "Great, {name}!", bn: "দারুণ, {name}!" },
          hint: {
            en: "তোরা means the people you are talking to.",
            bn: "তোরা মানে যাদের সঙ্গে কথা বলছেন।",
          },
          explanation: {
            en: "One person or many, the people you talk to are always “You”.",
            bn: "একজন হোক বা অনেকজন, যাদের সঙ্গে কথা বলছেন তারা সবসময় “You”।",
          },
        },
      ],
    },
    {
      id: "people-and-things",
      title: { en: "Person Can Refer to Things Too", bn: "Person দিয়ে বস্তুও বোঝানো যায়" },
      messages: [
        {
          en: "What about “My hand” or “My brother”? Person can refer to **people and things**.",
          bn: "“My hand” বা “My brother” হলে কী হবে? Person দিয়ে মানুষ ও বস্তু উভয়কেই বোঝানো যায়।",
        },
        {
          variant: "example",
          en: "Tanvir and I ride bicycles.",
          bn: "তানভীর এবং আমি সাইকেল চালাই।",
          glosses: [
            { text: "Tanvir", bn: "তানভীর" },
            { text: "and", bn: "এবং" },
            { text: "I", bn: "আমি" },
            { text: "ride", bn: "চালাই" },
            { text: "bicycles", bn: "সাইকেল" },
          ],
        },
        {
          en: "Subject: **Tanvir and I**\nPerson: **First Person**\nWhy? The speaker is included in “Tanvir and I.”",
          bn: "Subject: Tanvir and I (তানভীর এবং আমি)\nPerson: First Person\nকেন? “Tanvir and I” বলার সময় যে কথা বলছে, সেও অন্তর্ভুক্ত থাকে।",
        },
        {
          variant: "example",
          en: "My brother reads books.",
          bn: "আমার ভাই বই পড়ে।",
          glosses: [
            { text: "My brother", bn: "আমার ভাই" },
            { text: "reads", bn: "পড়ে" },
            { text: "books", bn: "বই" },
          ],
        },
        {
          en: "Subject: **My brother**\nPerson: **Third Person**\nWhy? The sentence is about the speaker's brother, not the speaker.",
          bn: "Subject: My brother (আমার ভাই)\nPerson: Third Person\nকেন? এখানে যে কথা বলছে, তাকে নয়, তার ভাইকে নিয়ে কথা বলা হচ্ছে।",
        },
        {
          variant: "example",
          en: "My hand hurts.",
          bn: "আমার হাতে ব্যথা।",
          glosses: [
            { text: "My hand", bn: "আমার হাত" },
            { text: "hurts", bn: "ব্যথা করে" },
          ],
        },
        {
          en: "Subject: **My hand**\nPerson: **Third Person**\nWhy? The sentence is about the hand.",
          bn: "Subject: My hand (আমার হাত)\nPerson: Third Person\nকেন? এখানে হাত সম্পর্কে কথা বলা হচ্ছে।",
        },
        {
          variant: "example",
          en: "The books are on the table.",
          bn: "বইগুলো টেবিলের ওপর আছে।",
          glosses: [
            { text: "The books", bn: "বইগুলো" },
            { text: "are", bn: "আছে" },
            { text: "on the table", bn: "টেবিলের ওপর" },
          ],
        },
        {
          en: "Subject: **The books**\nPerson: **Third Person**\nWhy? The sentence is about the books.",
          bn: "Subject: The books (বইগুলো)\nPerson: Third Person\nকেন? এখানে বইগুলো সম্পর্কে কথা বলা হচ্ছে।",
        },
        {
          variant: "remember",
          en: "Person depends on **who or what is being talked about**, not on who owns it.",
          bn: "Person নির্ধারণ করতে হবে বাক্যে কাকে বা কী নিয়ে কথা বলা হচ্ছে, তা দেখে। কোনো কিছুর মালিক কে, শুধু তা দেখে Person নির্ধারণ করা হয় না।",
        },
      ],
      questions: [
        {
          id: "q-person-sister-and-i",
          prompt: {
            en: "In “My sister and I read books,” which Person is the Subject?",
            bn: "“My sister and I read books.” (আমার বোন এবং আমি বই পড়ি।) বাক্যটিতে Subject কোন Person?",
          },
          options: PERSONS(["first", "second", "third"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: {
            en: "Is the speaker (“I”) inside the Subject?",
            bn: "Subject-এর মধ্যে কি বক্তা (“I”) আছে?",
          },
          explanation: {
            en: "“My sister and I” includes the speaker.",
            bn: "“My sister and I”-এর মধ্যে যে কথা বলছে, সেও অন্তর্ভুক্ত থাকে।",
          },
        },
        {
          id: "q-person-leg",
          prompt: {
            en: "In “My leg hurts,” which Person is the Subject?",
            bn: "“My leg hurts.” (আমার পায়ে ব্যথা।) বাক্যটিতে Subject কোন Person?",
          },
          options: PERSONS(["first", "second", "third"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: {
            en: "Is the sentence about the speaker, or about the leg?",
            bn: "বাক্যটা কি বক্তাকে নিয়ে, নাকি পা-কে নিয়ে?",
          },
          explanation: {
            en: "The sentence is about the leg, so the Subject is Third Person.",
            bn: "বাক্যটিতে পা সম্পর্কে কথা বলা হচ্ছে, তাই Subject হলো Third Person।",
          },
        },
        {
          id: "q-person-water-plants",
          prompt: {
            en: "In “My cousin and I water the plants,” which Person is the Subject?",
            bn: "“My cousin and I water the plants.” (আমার কাজিন এবং আমি গাছে পানি দিই।) বাক্যটিতে Subject কোন Person?",
          },
          options: PERSONS(["third", "first", "second"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: { en: "Look for “I” in the Subject.", bn: "Subject-এ “I” খুঁজুন।" },
          explanation: {
            en: "The speaker is included in “My cousin and I.”",
            bn: "“My cousin and I”-এর মধ্যে যে কথা বলছে, সেও অন্তর্ভুক্ত থাকে।",
          },
        },
      ],
    },
    {
      id: "mixed-subjects",
      title: { en: "Mixed Subjects: I First", bn: "মিশ্র Subject: আগে I" },
      messages: [
        {
          en: "Sometimes a Subject joins different people with “and”. Use this simple rule to find the Person:",
          bn: "কখনো কখনো Subject-এ “and” দিয়ে আলাদা আলাদা মানুষকে যুক্ত করা হয়। Person বের করতে এই সহজ নিয়মটি মেনে চলুন:",
          items: [
            {
              term: "Step 1",
              termBn: "ধাপ 1",
              en: "Is “I” (or “We”) in it? Then it is First Person.",
              bn: "এর মধ্যে কি “I” (বা “We”) আছে? তাহলে First Person।",
            },
            {
              term: "Step 2",
              termBn: "ধাপ 2",
              en: "No “I”, but “You” is in it? Then it is Second Person.",
              bn: "“I” নেই, কিন্তু “You” আছে? তাহলে Second Person।",
            },
            {
              term: "Step 3",
              termBn: "ধাপ 3",
              en: "No “I” and no “You”? Then it is Third Person.",
              bn: "“I”-ও নেই, “You”-ও নেই? তাহলে Third Person।",
            },
          ],
        },
        {
          en: "Each mixed Subject can be replaced by one word:",
          bn: "প্রতিটি মিশ্র Subject-কে একটি শব্দ দিয়ে বদলানো যায়:",
          table: table(
            [
              { en: "Subject", bn: "Subject" },
              { en: "Person", bn: "Person" },
              { en: "One word", bn: "এক শব্দে" },
            ],
            [
              ["Rafi and I", "First", "We"],
              ["You and Rafi", "Second", "You"],
              ["Rafi and Mina", "Third", "They"],
            ],
          ),
        },
        {
          variant: "remember",
          en: "{name}, check for **I** first, then for **You**. Also, in English we put I last: “My friend and I”, not “I and my friend”.",
          bn: "{name}, আগে I খুঁজুন, তারপর You। আরেকটি কথা: ইংরেজিতে I বসে শেষে: “My friend and I”, “I and my friend” নয়।",
        },
      ],
      questions: [
        {
          id: "q-person-mixed-you-sister",
          prompt: {
            en: "Which Person is “You and your sister”?",
            bn: "“You and your sister” (তুমি এবং তোমার বোন) কোন Person?",
          },
          options: PERSONS(["first", "second", "third"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "Is there an “I”? Is there a “You”?", bn: "“I” আছে কি? “You” আছে কি?" },
          explanation: {
            en: "There is no “I”, but there is “You”. So it is Second Person.",
            bn: "এখানে “I” নেই, কিন্তু “You” আছে। তাই এটি Second Person।",
          },
        },
        {
          id: "q-person-mixed-father-i",
          prompt: {
            en: "Which Person is “My father and I”?",
            bn: "“My father and I” (আমার বাবা এবং আমি) কোন Person?",
          },
          options: PERSONS(["third", "second", "first"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: { en: "Check for “I” first.", bn: "আগে “I” খুঁজুন।" },
          explanation: {
            en: "“I” is in the Subject, so it is First Person.",
            bn: "Subject-এ “I” আছে, তাই এটি First Person।",
          },
        },
        {
          id: "q-person-mixed-rafi-cousin",
          prompt: {
            en: "Which Person is “Rafi and his cousin”?",
            bn: "“Rafi and his cousin” (রাফি এবং তার কাজিন) কোন Person?",
          },
          options: PERSONS(["first", "second", "third"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.great,
          hint: { en: "No “I” and no “You”. What is left?", bn: "“I” নেই, “You”-ও নেই। তাহলে কী?" },
          explanation: {
            en: "Both people are being talked about, so it is Third Person.",
            bn: "দুজনের সম্পর্কেই কথা বলা হচ্ছে, তাই এটি Third Person।",
          },
        },
        {
          id: "q-person-mixed-replace",
          prompt: {
            en: "Which one word can replace “You and Rafi”?",
            bn: "“You and Rafi”-কে কোন একটি শব্দ দিয়ে বদলানো যায়?",
          },
          options: options(["We"], ["You"], ["They"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.excellent,
          hint: { en: "“You” is inside, and “I” is not.", bn: "ভেতরে “You” আছে, “I” নেই।" },
          explanation: {
            en: "“You and Rafi” is Second Person, so the one word is “You”.",
            bn: "“You and Rafi” হলো Second Person, তাই এক শব্দে “You”।",
          },
        },
      ],
    },
    ...(DECODE_PRONOUNS_CHUNK ? [DECODE_PRONOUNS_CHUNK] : []),
    {
      id: "person-review",
      title: { en: "Person: Final Review", bn: "Person: চূড়ান্ত অনুশীলন" },
      messages: [
        {
          en: "**Person** tells us whether the Subject is the speaker, the person being spoken to, or the person or thing being talked about.",
          bn: "Person আমাদের জানায়, Subject হলো যে কথা বলছে, যাকে উদ্দেশ্য করে কথা বলা হচ্ছে, নাকি যে ব্যক্তি বা বস্তু সম্পর্কে কথা বলা হচ্ছে।",
          items: [
            {
              term: "First Person",
              termBn: "প্রথম পুরুষ",
              en: "The speaker is included.",
              bn: "যে কথা বলছে, সে অন্তর্ভুক্ত থাকে।",
            },
            {
              term: "Second Person",
              termBn: "দ্বিতীয় পুরুষ",
              en: "The person or people being spoken to.",
              bn: "যাকে বা যাদের উদ্দেশ্য করে কথা বলা হচ্ছে।",
            },
            {
              term: "Third Person",
              termBn: "তৃতীয় পুরুষ",
              en: "The person or thing being talked about.",
              bn: "যে ব্যক্তি বা বস্তু সম্পর্কে কথা বলা হচ্ছে।",
            },
          ],
        },
        {
          en: "A Subject can be a person, a body part or another thing. To find Person, look at who or what the sentence is about and how it relates to the speaker.",
          bn: "Subject কোনো ব্যক্তি, শরীরের অংশ বা অন্য কোনো বস্তুকে বোঝাতে পারে। Person চিহ্নিত করতে বাক্যে কাকে বা কী নিয়ে কথা বলা হচ্ছে এবং তার সঙ্গে বক্তার সম্পর্ক কী, তা বুঝতে হবে।",
        },
        {
          en: "Why does Person matter? It chooses the Verb: **I am**, **You are**, **He is**. {name}, you will use this in the Verb step.",
          bn: "Person কেন জরুরি? কারণ Person অনুযায়ী Verb বদলায়: I am, You are, He is। {name}, Verb ধাপে আপনি এটা ব্যবহার করবেন।",
        },
        LETS_TEST,
      ],
      questions: [
        {
          id: "q-person-review-library",
          prompt: {
            en: "In “We visit the library,” which Person is the Subject?",
            bn: "“We visit the library.” (আমরা লাইব্রেরিতে যাই।) বাক্যটিতে Subject কোন Person?",
          },
          options: PERSONS(["first", "second", "third"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: { en: "Does “We” include the speaker?", bn: "“We”-তে কি বক্তা আছে?" },
          explanation: {
            en: "“We” includes the speaker.",
            bn: "“We” বলতে যে কথা বলছে, সে নিজেও অন্তর্ভুক্ত থাকে।",
          },
        },
        {
          id: "q-person-review-you-brother",
          prompt: {
            en: "In “You and your brother are welcome,” which Person is the Subject?",
            bn: "“You and your brother are welcome.” (তোমাকে আর তোমার ভাইকে স্বাগতম।) বাক্যটিতে Subject কোন Person?",
          },
          options: PERSONS(["first", "second", "third"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "Is there an “I”? Is there a “You”?", bn: "“I” আছে কি? “You” আছে কি?" },
          explanation: {
            en: "“You” is in the Subject and “I” is not, so it is Second Person.",
            bn: "Subject-এ “You” আছে কিন্তু “I” নেই, তাই এটি Second Person।",
          },
        },
        {
          id: "q-person-review-aunt",
          prompt: {
            en: "In “Mina and Sadia visit their aunt,” which Person is the Subject?",
            bn: "“Mina and Sadia visit their aunt.” (মিনা ও সাদিয়া তাদের খালাকে দেখতে যায়।) বাক্যটিতে Subject কোন Person?",
          },
          options: PERSONS(["first", "second", "third"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: {
            en: "Are Mina and Sadia speaking, or being talked about?",
            bn: "মিনা আর সাদিয়া কি কথা বলছে, নাকি ওদের নিয়ে কথা হচ্ছে?",
          },
          explanation: {
            en: "“Mina and Sadia” are the people being talked about.",
            bn: "“Mina and Sadia” বলতে যাদের সম্পর্কে কথা বলা হচ্ছে, তাদের বোঝায়।",
          },
        },
        {
          id: "q-person-review-group",
          prompt: {
            en: "Which group contains only First Person Subjects?",
            bn: "কোন দলে শুধু First Person Subject রয়েছে?",
          },
          options: options(["You, He", "তুমি, সে"], ["I, We", "আমি, আমরা"], ["They, She", "তারা, সে"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "First Person always includes the speaker.", bn: "First Person-এ সবসময় বক্তা থাকে।" },
          explanation: {
            en: "“I” and “We” include the speaker.",
            bn: "“I” এবং “We” বলতে যে কথা বলছে, তাকে বা তার দলকে বোঝায়।",
          },
        },
        {
          id: "q-person-review-eyes",
          prompt: {
            en: "In “My eyes are tired,” which Person is the Subject?",
            bn: "“My eyes are tired.” (আমার চোখ ক্লান্ত।) বাক্যটিতে Subject কোন Person?",
          },
          options: PERSONS(["first", "second", "third"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: {
            en: "Is the sentence about the speaker, or about the eyes?",
            bn: "বাক্যটা কি বক্তাকে নিয়ে, নাকি চোখকে নিয়ে?",
          },
          explanation: {
            en: "The sentence is about the eyes, so it is Third Person. “My” only tells whose eyes.",
            bn: "বাক্যটিতে চোখ সম্পর্কে কথা বলা হচ্ছে, তাই এটি Third Person। “My” শুধু বলে চোখ কার।",
          },
        },
        {
          id: "q-person-review-tanvir",
          prompt: {
            en: "In “Tanvir and I ride bicycles,” which Person is the Subject?",
            bn: "“Tanvir and I ride bicycles.” (তানভীর এবং আমি সাইকেল চালাই।) বাক্যটিতে Subject কোন Person?",
          },
          options: PERSONS(["second", "third", "first"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.excellent,
          hint: { en: "Find “I” in the Subject.", bn: "Subject-এ “I” খুঁজুন।" },
          explanation: {
            en: "“Tanvir and I” includes the speaker.",
            bn: "“Tanvir and I”-এর মধ্যে যে কথা বলছে, সেও অন্তর্ভুক্ত থাকে।",
          },
        },
        {
          id: "q-person-review-grandmother",
          prompt: {
            en: "My grandmother is at home. ___ is happy.",
            bn: "My grandmother is at home. ___ is happy. (আমার দাদি বাসায় আছেন। তিনি খুশি।) শূন্যস্থানে কোনটি বসবে?",
          },
          options: options(["He"], ["She"], ["It"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "Is a grandmother a man or a woman?", bn: "দাদি কি পুরুষ, নাকি মহিলা?" },
          explanation: { en: "A grandmother is a woman, so “She”.", bn: "দাদি একজন মহিলা, তাই “She”।" },
        },
        {
          id: "q-person-review-tui",
          prompt: {
            en: "“তুই কোথায়?” What is the Subject in English?",
            bn: "“তুই কোথায়?” ইংরেজিতে Subject কোনটি হবে?",
          },
          options: options(["He"], ["I"], ["You"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.great,
          hint: { en: "তুই is the person you are talking to.", bn: "তুই মানে যার সঙ্গে কথা বলছেন।" },
          explanation: { en: "আপনি, তুমি, তুই: all are “You”.", bn: "আপনি, তুমি, তুই: সবই “You”।" },
        },
        {
          id: "q-person-review-statement",
          prompt: { en: "Which statement about Person is correct?", bn: "Person সম্পর্কে কোন কথাটি সঠিক?" },
          options: options(
            ["Third Person refers only to people.", "Third Person শুধু মানুষকে বোঝায়।"],
            [
              "Second Person refers to the person or people being spoken to.",
              "Second Person বলতে যাকে বা যাদের উদ্দেশ্য করে কথা বলা হচ্ছে, তাদের বোঝায়।",
            ],
            ["First Person never includes the speaker.", "First Person-এ বক্তা কখনো অন্তর্ভুক্ত থাকে না।"],
          ),
          correctOptionId: "b",
          praise: { en: "Excellent, {name}!", bn: "চমৎকার, {name}!" },
          hint: {
            en: "Think about “you”. Can it mean one person or many?",
            bn: "“you” নিয়ে ভাবুন। এটা কি একজন বা অনেকজনকে বোঝাতে পারে?",
          },
          explanation: {
            en: "Second Person can refer to one person or several people.",
            bn: "Second Person একজন বা একাধিক ব্যক্তিকে বোঝাতে পারে।",
          },
        },
      ],
    },
  ],
};
