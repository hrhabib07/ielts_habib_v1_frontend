import type { ChatLessonStep } from "@/src/features/chat-lesson/types";
// Relative `.ts` import so the Node audio/export scripts can load this file directly.
import { options, PRAISE, table } from "./helpers.ts";

export const OBJECT_STEP: ChatLessonStep = {
  id: "level-1-step-8-object",
  missionLabel: "Level 1",
  stepLabel: "Lesson 6",
  title: { en: "Meet the Object", bn: "Object-এর সঙ্গে পরিচিত হোন" },
  guideName: "Gamlish",
  chunks: [
    {
      id: "what-is-object",
      title: { en: "What Is an Object?", bn: "Object কী?" },
      messages: [
        {
          en: "{name}, an **Object** is a person or thing that **receives the action** of a Verb.",
          bn: "{name}, Object হলো সেই ব্যক্তি বা বস্তু, যার ওপর Verb-এর কাজটি করা হয়।",
        },
        {
          variant: "example",
          en: "I read a book.",
          bn: "আমি একটি বই পড়ি।",
          glosses: [
            { text: "I", bn: "আমি" },
            { text: "read", bn: "পড়ি" },
            { text: "a book", bn: "একটি বই" },
          ],
        },
        {
          en: "Subject: **I**\nVerb: **read**\nObject: **a book**",
          bn: "Subject: I (আমি)\nVerb: read (পড়ি)\nObject: a book (একটি বই)",
        },
        {
          en: "Ask yourself, “What do I read?” The answer is “a book.” So, **a book** is the Object.",
          bn: "নিজেকে প্রশ্ন করুন, “আমি কী পড়ি?” উত্তর হলো “a book”। তাই a book হলো Object।",
        },
        {
          en: "Let's see if you can identify the Object!",
          bn: "চলুন দেখি, আপনি Object চিহ্নিত করতে পারেন কি না!",
        },
      ],
      questions: [
        {
          id: "q-object-read-book",
          title: { en: "Understand the Object", bn: "Object বুঝে নিন" },
          prompt: {
            en: "In the sentence “I read a book,” what is the Object?",
            bn: "“I read a book” বাক্যে Object কোনটি?",
          },
          options: options(["I", "আমি"], ["read", "পড়ি"], ["a book", "একটি বই"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: { en: "What do I read?", bn: "আমি কী পড়ি?" },
          explanation: {
            en: "“A book” receives the action of the Verb “read.”",
            bn: "“read” Verb-এর কাজটি “a book”-এর ওপর করা হয়, তাই “a book” হলো Object।",
          },
        },
        {
          id: "q-object-play-football",
          title: { en: "Find the Object", bn: "Object খুঁজে বের করুন" },
          prompt: { en: "Read the sentence. What do we play?", bn: "বাক্যটি পড়ুন। আমরা কী খেলি?" },
          sentence: "We play football.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "play", bn: "খেলি" },
            { text: "football", bn: "ফুটবল" },
          ],
          options: options(["We", "আমরা"], ["play", "খেলি"], ["football", "ফুটবল"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Great job, {name}!", bn: "দারুণ, {name}!" },
          hint: { en: "The Object comes after the Verb “play”.", bn: "Object আছে “play” Verb-এর পরে।" },
          explanation: {
            en: "We play football, so “football” is the Object.",
            bn: "আমরা football খেলি, তাই “football” হলো Object।",
          },
        },
        {
          id: "q-object-sister-reads",
          title: { en: "Check Your Understanding", bn: "নিজের বোঝাপড়া যাচাই করুন" },
          prompt: { en: "Read the sentence. Which part is the Object?", bn: "বাক্যটি পড়ুন। কোন অংশটি Object?" },
          sentence: "My sister reads a book.",
          sentenceGlosses: [
            { text: "My sister", bn: "আমার বোন" },
            { text: "reads", bn: "পড়ে" },
            { text: "a book", bn: "একটি বই" },
          ],
          options: options(["My sister", "আমার বোন"], ["reads", "পড়ে"], ["a book", "একটি বই"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Well done!", bn: "খুব ভালো!" },
          hint: { en: "What does my sister read?", bn: "আমার বোন কী পড়ে?" },
          explanation: {
            en: "“A book” is the Object because it receives the action of the Verb.",
            bn: "“a book” হলো Object, কারণ Verb-এর কাজটি এর ওপর করা হয়।",
          },
        },
      ],
    },
    {
      id: "find-the-object",
      title: { en: "How to Find the Object", bn: "Object কীভাবে খুঁজবেন" },
      messages: [
        {
          en: "First, find the Verb. Then ask **“what?”** or **“whom?”** after the Verb to find the Object.",
          bn: "প্রথমে Verb খুঁজে বের করুন। তারপর Verb-এর পরে “কী?” বা “কাকে?” প্রশ্ন করে Object খুঁজে বের করুন।",
        },
        {
          variant: "example",
          en: "We drink water.",
          bn: "আমরা পানি পান করি।",
          glosses: [
            { text: "We", bn: "আমরা" },
            { text: "drink", bn: "পান করি" },
            { text: "water", bn: "পানি" },
          ],
        },
        {
          en: "Subject: **We**\nVerb: **drink**\nObject: **water**\nWhat do we drink? Water! So, **water** is the Object.",
          bn: "Subject: We (আমরা)\nVerb: drink (পান করি)\nObject: water (পানি)\nআমরা কী পান করি? পানি! তাই water হলো Object।",
        },
      ],
      questions: [
        {
          id: "q-object-eat-rice",
          title: { en: "Find the Object", bn: "Object খুঁজে বের করুন" },
          prompt: {
            en: "Read the sentence. First, find the Verb. Then ask “what?” to find the Object.",
            bn: "বাক্যটি পড়ুন। প্রথমে Verb খুঁজে বের করুন। তারপর “কী?” প্রশ্ন করে Object চিহ্নিত করুন।",
          },
          sentence: "They eat rice.",
          sentenceGlosses: [
            { text: "They", bn: "তারা" },
            { text: "eat", bn: "খায়" },
            { text: "rice", bn: "ভাত" },
          ],
          options: options(["They", "তারা"], ["eat", "খায়"], ["rice", "ভাত"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Great job!", bn: "দারুণ!" },
          hint: { en: "The Verb is “eat”. What do they eat?", bn: "Verb হলো “eat”। তারা কী খায়?" },
          explanation: {
            en: "What do they eat? Rice! So, “rice” is the Object.",
            bn: "তারা কী খায়? ভাত! তাই “rice” হলো Object।",
          },
        },
        {
          id: "q-object-help-friend",
          title: { en: "Who Receives the Action?", bn: "কাজটি কার ওপর হচ্ছে?" },
          prompt: {
            en: "Read the sentence. First, find the Verb. Then ask “whom?” to find the Object.",
            bn: "বাক্যটি পড়ুন। প্রথমে Verb খুঁজে বের করুন। তারপর “কাকে?” প্রশ্ন করে Object চিহ্নিত করুন।",
          },
          sentence: "I help my friend.",
          sentenceGlosses: [
            { text: "I", bn: "আমি" },
            { text: "help", bn: "সাহায্য করি" },
            { text: "my friend", bn: "আমার বন্ধুকে" },
          ],
          options: options(["I", "আমি"], ["help", "সাহায্য করি"], ["my friend", "আমার বন্ধু"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.excellent,
          hint: { en: "The Verb is “help”. Whom do I help?", bn: "Verb হলো “help”। আমি কাকে সাহায্য করি?" },
          explanation: {
            en: "Whom do I help? My friend! So, “my friend” is the Object.",
            bn: "আমি কাকে সাহায্য করি? আমার বন্ধুকে! তাই “my friend” হলো Object।",
          },
        },
      ],
    },
    {
      id: "object-length",
      title: { en: "One Word or Several Words", bn: "একটি শব্দ বা একাধিক শব্দ" },
      messages: [
        {
          en: "An Object can be **one word** or **a group of words**.",
          bn: "Object একটি শব্দ বা একাধিক শব্দ নিয়ে গঠিত হতে পারে।",
          table: table(
            [
              { en: "Sentence", bn: "বাক্য" },
              { en: "Object", bn: "Object" },
            ],
            [
              [
                { en: "I drink water.", bn: "I drink water. (আমি পানি পান করি।)" },
                { en: "water", bn: "water (পানি)" },
              ],
              [
                { en: "We read storybooks.", bn: "We read storybooks. (আমরা গল্পের বই পড়ি।)" },
                { en: "storybooks", bn: "storybooks (গল্পের বইগুলো)" },
              ],
              [
                { en: "You open the classroom door.", bn: "You open the classroom door. (তুমি শ্রেণিকক্ষের দরজা খোলো।)" },
                { en: "the classroom door", bn: "the classroom door (শ্রেণিকক্ষের দরজাটি)" },
              ],
            ],
          ),
        },
        {
          en: "In the last sentence, **the classroom door** is the complete Object.",
          bn: "শেষ বাক্যে “the classroom door” পুরো অংশটি Object।",
        },
      ],
      questions: [
        {
          id: "q-object-storybooks",
          title: { en: "Find the Object", bn: "Object খুঁজে বের করুন" },
          prompt: { en: "Read the sentence. What is the Object?", bn: "বাক্যটি পড়ুন। এখানে Object কোনটি?" },
          sentence: "We read storybooks.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "read", bn: "পড়ি" },
            { text: "storybooks", bn: "গল্পের বই" },
          ],
          options: options(["We", "আমরা"], ["read", "পড়ি"], ["storybooks", "গল্পের বই"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Great job!", bn: "দারুণ!" },
          hint: { en: "What do we read?", bn: "আমরা কী পড়ি?" },
          explanation: {
            en: "“Storybooks” is the Object. An Object can be just one word.",
            bn: "“Storybooks” হলো Object। Object একটি শব্দও হতে পারে।",
          },
        },
        {
          id: "q-object-classroom-door",
          title: { en: "One Word or Several Words?", bn: "একটি শব্দ, নাকি একাধিক?" },
          prompt: {
            en: "Read the sentence. Which words make up the complete Object?",
            bn: "বাক্যটি পড়ুন। কোন শব্দগুলো মিলে পুরো Object তৈরি করেছে?",
          },
          sentence: "You open the classroom door.",
          sentenceGlosses: [
            { text: "You", bn: "তুমি" },
            { text: "open", bn: "খোলো" },
            { text: "the classroom door", bn: "শ্রেণিকক্ষের দরজাটি" },
          ],
          options: options(
            ["the classroom", "শ্রেণিকক্ষটি"],
            ["door", "দরজা"],
            ["the classroom door", "শ্রেণিকক্ষের দরজাটি"],
          ),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.excellent,
          hint: {
            en: "What do you open? Take all the words that answer it.",
            bn: "আপনি কী খোলেন? উত্তরের সব শব্দ নিন।",
          },
          explanation: {
            en: "“The classroom door” is the complete Object, because an Object can contain several words.",
            bn: "“The classroom door” হলো পুরো Object, কারণ Object একাধিক শব্দ নিয়ে গঠিত হতে পারে।",
          },
        },
        {
          id: "q-object-their-room",
          title: { en: "Decode the Sentence", bn: "বাক্যটি ডিকোড করুন" },
          prompt: { en: "Read the sentence. Which statement is correct?", bn: "বাক্যটি পড়ুন। কোন তথ্যটি সঠিক?" },
          sentence: "They clean their room.",
          sentenceGlosses: [
            { text: "They", bn: "তারা" },
            { text: "clean", bn: "পরিষ্কার করে" },
            { text: "their room", bn: "তাদের ঘর" },
          ],
          options: options(
            ["The Object is “their.”", "Object হলো “their”।"],
            ["The Object is “their room.”", "Object হলো “their room”।"],
            ["The Object is “clean their.”", "Object হলো “clean their”।"],
          ),
          correctOptionId: "b",
          praise: { en: "Well done, {name}!", bn: "খুব ভালো, {name}!" },
          hint: {
            en: "What do they clean? “their” alone does not answer that.",
            bn: "তারা কী পরিষ্কার করে? শুধু “their” দিয়ে উত্তর হয় না।",
          },
          explanation: {
            en: "“Their room” is the complete Object. Always find the whole group of words that acts as the Object.",
            bn: "“Their room” হলো পুরো Object। মনে রাখবেন, Object হিসেবে ব্যবহৃত সম্পূর্ণ শব্দগুচ্ছটি চিহ্নিত করতে হবে।",
          },
        },
      ],
    },
    {
      id: "no-object",
      title: { en: "Does Every Sentence Have an Object?", bn: "সব বাক্যে কি Object থাকে?" },
      messages: [
        {
          en: "**No.** Some sentences have an Object, but some do not.",
          bn: "না। কিছু বাক্যে Object থাকে, আবার কিছু বাক্যে Object থাকে না।",
        },
        {
          variant: "example",
          en: "We read books.",
          bn: "আমরা বই পড়ি।",
          glosses: [
            { text: "We", bn: "আমরা" },
            { text: "read", bn: "পড়ি" },
            { text: "books", bn: "বই" },
          ],
        },
        {
          en: "Subject: **We**\nVerb: **read**\nObject: **books**",
          bn: "Subject: We (আমরা)\nVerb: read (পড়ি)\nObject: books (বই)",
        },
        {
          variant: "example",
          en: "They sleep.",
          bn: "তারা ঘুমায়।",
          glosses: [
            { text: "They", bn: "তারা" },
            { text: "sleep", bn: "ঘুমায়" },
          ],
        },
        {
          en: "Subject: **They**\nVerb: **sleep**\nObject: none\n“They sleep” is complete **without an Object**.",
          bn: "Subject: They (তারা)\nVerb: sleep (ঘুমায়)\nObject: নেই\n“They sleep” বাক্যটি Object ছাড়াই সম্পূর্ণ।",
        },
      ],
      questions: [
        {
          id: "q-object-they-sleep",
          title: { en: "Does This Sentence Need an Object?", bn: "এই বাক্যে কি Object লাগে?" },
          prompt: {
            en: "Read the sentence. Does this sentence have an Object?",
            bn: "বাক্যটি পড়ুন। এই বাক্যে কি Object আছে?",
          },
          sentence: "They sleep.",
          sentenceGlosses: [
            { text: "They", bn: "তারা" },
            { text: "sleep", bn: "ঘুমায়" },
          ],
          options: options(
            ["Yes, “They” is the Object.", "হ্যাঁ, “They” হলো Object।"],
            ["Yes, “sleep” is the Object.", "হ্যাঁ, “sleep” হলো Object।"],
            ["No, the sentence has no Object.", "না, বাক্যটিতে কোনো Object নেই।"],
          ),
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: {
            en: "“They” is the Subject and “sleep” is the Verb. Is anything left?",
            bn: "“They” হলো Subject আর “sleep” হলো Verb। আর কিছু কি বাকি আছে?",
          },
          explanation: {
            en: "“They sleep” is a complete sentence without an Object.",
            bn: "“They sleep” বাক্যটি Object ছাড়াই সম্পূর্ণ।",
          },
        },
        {
          id: "q-object-they-run",
          title: { en: "Find the Sentence Without an Object", bn: "Object ছাড়া বাক্যটি খুঁজে বের করুন" },
          prompt: { en: "Which sentence has no Object?", bn: "কোন বাক্যে Object নেই?" },
          options: options(
            ["We read books.", "আমরা বই পড়ি।"],
            ["I drink water.", "আমি পানি পান করি।"],
            ["They run.", "তারা দৌড়ায়।"],
          ),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Great job!", bn: "দারুণ!" },
          hint: {
            en: "Ask “what?” after each Verb. Which one has no answer?",
            bn: "প্রতিটি Verb-এর পরে “কী?” প্রশ্ন করুন। কোনটির উত্তর নেই?",
          },
          explanation: {
            en: "“They run” has a Subject and a Verb, but no Object. The sentence is still complete.",
            bn: "“They run” বাক্যে Subject ও Verb আছে, কিন্তু Object নেই। তবুও বাক্যটি সম্পূর্ণ।",
          },
        },
        {
          id: "q-object-two-sentences",
          title: { en: "Identify the Complete Sentence", bn: "সম্পূর্ণ বাক্যটি চিনে নিন" },
          prompt: { en: "Read both sentences. Which statement is correct?", bn: "বাক্য দুটি পড়ুন। কোন তথ্যটি সঠিক?" },
          sentence: "Sentence 1: We clean our room.\nSentence 2: We sleep.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "clean", bn: "পরিষ্কার করি" },
            { text: "our room", bn: "আমাদের ঘর" },
            { text: "sleep", bn: "ঘুমাই" },
          ],
          options: options(
            ["Both sentences have an Object.", "দুটি বাক্যেই Object আছে।"],
            ["Only Sentence 1 has an Object.", "শুধু বাক্য 1-এ Object আছে।"],
            ["Only Sentence 2 has an Object.", "শুধু বাক্য 2-এ Object আছে।"],
          ),
          correctOptionId: "b",
          praise: PRAISE.excellent,
          hint: {
            en: "Ask “what?” after “clean” and after “sleep”.",
            bn: "“clean” আর “sleep”-এর পরে “কী?” প্রশ্ন করুন।",
          },
          explanation: {
            en: "“Our room” is the Object in Sentence 1. Sentence 2 is complete without an Object.",
            bn: "প্রথম বাক্যে “our room” হলো Object। দ্বিতীয় বাক্যটি Object ছাড়াই সম্পূর্ণ।",
          },
        },
      ],
    },
    {
      id: "object-or-place",
      title: { en: "Object or Place?", bn: "Object, নাকি স্থান?" },
      messages: [
        { en: "{name}, look at these two sentences:", bn: "{name}, এই দুটি বাক্য দেখুন:" },
        {
          variant: "example",
          en: "We clean the park.",
          bn: "আমরা পার্ক পরিষ্কার করি।",
          glosses: [
            { text: "We", bn: "আমরা" },
            { text: "clean", bn: "পরিষ্কার করি" },
            { text: "the park", bn: "পার্ক" },
          ],
        },
        {
          variant: "example",
          en: "We play in the park.",
          bn: "আমরা পার্কে খেলি।",
          glosses: [
            { text: "We", bn: "আমরা" },
            { text: "play", bn: "খেলি" },
            { text: "in the park", bn: "পার্কে" },
          ],
        },
        {
          en: "In the first, the park receives the action: we clean it. It is the **Object**. In the second, “in the park” tells us **where**. It is a **place**, not an Object.",
          bn: "প্রথম বাক্যে কাজটি পার্কের ওপর হচ্ছে: আমরা পার্কটি পরিষ্কার করি। তাই এটি Object। দ্বিতীয় বাক্যে “in the park” বলছে কোথায়। এটি স্থান, Object নয়।",
        },
        {
          variant: "remember",
          en: "Words like **in**, **at**, **on** and **to** usually start a place. Ask “what?” or “whom?” for the Object, and “where?” for the place.",
          bn: "in, at, on, to-এর মতো শব্দ দিয়ে সাধারণত স্থান শুরু হয়। Object পেতে “কী?” বা “কাকে?” প্রশ্ন করুন, আর স্থান পেতে “কোথায়?”।",
        },
      ],
      questions: [
        {
          id: "q-object-bus-stop",
          title: { en: "Object or Place?", bn: "Object, নাকি স্থান?" },
          prompt: { en: "Read the sentence. Which statement is correct?", bn: "বাক্যটি পড়ুন। কোন তথ্যটি সঠিক?" },
          sentence: "We wait at the bus stop.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "wait", bn: "অপেক্ষা করি" },
            { text: "at the bus stop", bn: "বাস স্টপে" },
          ],
          options: options(
            ["The Object is “the bus stop.”", "Object হলো “the bus stop”।"],
            [
              "There is no Object. “at the bus stop” is a place.",
              "Object নেই। “at the bus stop” হলো স্থান।",
            ],
            ["The Object is “We.”", "Object হলো “We”।"],
          ),
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "Does “at the bus stop” tell what, or where?", bn: "“at the bus stop” কি বলে কী, নাকি কোথায়?" },
          explanation: {
            en: "“at the bus stop” tells us where we wait. It is a place, so this sentence has no Object.",
            bn: "“at the bus stop” বলে আমরা কোথায় অপেক্ষা করি। এটি স্থান, তাই এই বাক্যে Object নেই।",
          },
        },
        {
          id: "q-object-paint-classroom",
          title: { en: "Find the Object", bn: "Object খুঁজে বের করুন" },
          prompt: { en: "Which sentence has an Object?", bn: "কোন বাক্যে Object আছে?" },
          options: options(
            ["They study in the classroom.", "তারা শ্রেণিকক্ষে পড়াশোনা করে।"],
            ["They paint the classroom.", "তারা শ্রেণিকক্ষ রং করে।"],
            ["They sit in the classroom.", "তারা শ্রেণিকক্ষে বসে।"],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: { en: "In which sentence does the classroom receive the action?", bn: "কোন বাক্যে কাজটি শ্রেণিকক্ষের ওপর হচ্ছে?" },
          explanation: {
            en: "They paint what? The classroom. In the other two, “in the classroom” is a place.",
            bn: "তারা কী রং করে? শ্রেণিকক্ষ। বাকি দুটিতে “in the classroom” হলো স্থান।",
          },
        },
      ],
    },
    {
      id: "object-pronouns",
      title: { en: "me, him, her, us, them", bn: "me, him, her, us, them" },
      messages: [
        {
          en: "When a person word comes **after** the Verb as the Object, it changes its form.",
          bn: "ব্যক্তিবাচক শব্দ যখন Verb-এর পরে Object হিসেবে বসে, তখন এর রূপ বদলে যায়।",
          table: table(
            [
              { en: "Subject (before the Verb)", bn: "Subject (Verb-এর আগে)" },
              { en: "Object (after the Verb)", bn: "Object (Verb-এর পরে)" },
              { en: "Bangla", bn: "বাংলা" },
            ],
            [
              ["I", "me", "আমাকে"],
              ["He", "him", { en: "him (a boy or man)", bn: "তাকে (ছেলে বা পুরুষ)" }],
              ["She", "her", { en: "her (a girl or woman)", bn: "তাকে (মেয়ে বা মহিলা)" }],
              ["We", "us", "আমাদের"],
              ["They", "them", "তাদের"],
              ["You", "you", "তোমাকে / আপনাকে"],
              ["It", "it", "এটাকে"],
            ],
          ),
        },
        {
          variant: "example",
          en: "He helps me. I help him.",
          bn: "সে আমাকে সাহায্য করে। আমি তাকে সাহায্য করি।",
          glosses: [
            { text: "He", bn: "সে" },
            { text: "helps", bn: "সাহায্য করে" },
            { text: "me", bn: "আমাকে" },
            { text: "I", bn: "আমি" },
            { text: "help", bn: "সাহায্য করি" },
            { text: "him", bn: "তাকে" },
          ],
        },
        {
          variant: "remember",
          en: "Remember, {name}:\nBefore the Verb: **I, he, she, we, they**.\nAfter the Verb: **me, him, her, us, them**.",
          bn: "{name}, মনে রাখুন:\nVerb-এর আগে: I, he, she, we, they।\nVerb-এর পরে: me, him, her, us, them।",
        },
      ],
      questions: [
        {
          id: "q-object-know-him",
          title: { en: "After the Verb", bn: "Verb-এর পরে" },
          prompt: { en: "Which English sentence is correct?", bn: "কোন ইংরেজি বাক্যটি সঠিক?" },
          sourceBn: "আমি তাকে চিনি। (রাফিকে)",
          options: options(["I know he."], ["I know him."], ["Me know him."]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "After the Verb, “he” changes.", bn: "Verb-এর পরে “he” বদলে যায়।" },
          explanation: {
            en: "“I” is the Subject before the Verb. After the Verb, “he” becomes “him”.",
            bn: "Verb-এর আগে Subject “I”। Verb-এর পরে “he” হয়ে যায় “him”।",
          },
        },
        {
          id: "q-object-helps-us",
          prompt: {
            en: "Our teacher helps ___.",
            bn: "Our teacher helps ___. (আমাদের শিক্ষক আমাদের সাহায্য করেন।) শূন্যস্থানে কোনটি বসবে?",
          },
          options: options(["we"], ["us"], ["our"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: { en: "The blank is after the Verb.", bn: "শূন্যস্থানটি Verb-এর পরে।" },
          explanation: { en: "After the Verb, “we” becomes “us”.", bn: "Verb-এর পরে “we” হয়ে যায় “us”।" },
        },
        {
          id: "q-object-calls-me",
          prompt: {
            en: "My grandmother calls ___ every day.",
            bn: "My grandmother calls ___ every day. (আমার দাদি প্রতিদিন আমাকে ফোন করেন।) শূন্যস্থানে কোনটি বসবে?",
          },
          options: options(["I"], ["me"], ["my"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "The blank is after the Verb “calls”.", bn: "শূন্যস্থানটি “calls” Verb-এর পরে।" },
          explanation: { en: "After the Verb, “I” becomes “me”.", bn: "Verb-এর পরে “I” হয়ে যায় “me”।" },
        },
        {
          id: "q-object-we-visit",
          prompt: {
            en: "___ visit them every Friday.",
            bn: "___ visit them every Friday. (আমরা প্রতি শুক্রবার তাদের দেখতে যাই।) শূন্যস্থানে কোনটি বসবে?",
          },
          options: options(["We"], ["Us"], ["Our"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.excellent,
          hint: { en: "The blank is before the Verb. It is the Subject.", bn: "শূন্যস্থানটি Verb-এর আগে। এটি Subject।" },
          explanation: {
            en: "Before the Verb, we use the Subject form: “We”.",
            bn: "Verb-এর আগে Subject রূপ বসে: “We”।",
          },
        },
      ],
    },
    {
      id: "object-review",
      title: { en: "Final Review", bn: "চূড়ান্ত অনুশীলন" },
      messages: [
        {
          variant: "remember",
          en: "An **Object** is a person or thing that receives the action of a Verb. To find it, first find the Verb, then ask **“what?”** or **“whom?”** after it. An Object can be one word or a group of words. And not every sentence has an Object.",
          bn: "Object হলো সেই ব্যক্তি বা বস্তু, যার ওপর Verb-এর কাজটি করা হয়। Object খুঁজে বের করতে প্রথমে Verb চিহ্নিত করুন, তারপর Verb-এর পরে “কী?” বা “কাকে?” প্রশ্ন করুন। Object একটি শব্দ বা একাধিক শব্দ নিয়ে গঠিত হতে পারে। মনে রাখবেন, প্রতিটি বাক্যে Object থাকে না।",
        },
        {
          en: "{name}, let's see how much you have learned about Objects!",
          bn: "{name}, চলুন দেখি, Object সম্পর্কে আপনি কতটা শিখেছেন!",
        },
      ],
      questions: [
        {
          id: "q-object-review-match",
          title: { en: "Find the Object", bn: "Object খুঁজে বের করুন" },
          prompt: { en: "Read the sentence. What is the Object?", bn: "বাক্যটি পড়ুন। এখানে Object কোনটি?" },
          sentence: "We watch a match.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "watch", bn: "দেখি" },
            { text: "a match", bn: "একটি ম্যাচ" },
          ],
          options: options(["We", "আমরা"], ["watch", "দেখি"], ["a match", "একটি ম্যাচ"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: { en: "What do we watch?", bn: "আমরা কী দেখি?" },
          explanation: {
            en: "What do we watch? A match! So, “a match” is the Object.",
            bn: "আমরা কী দেখি? একটি ম্যাচ! তাই “a match” হলো Object।",
          },
        },
        {
          id: "q-object-review-whom",
          title: { en: "Ask the Right Question", bn: "সঠিক প্রশ্নটি করুন" },
          prompt: {
            en: "Read the sentence. Which question helps you find the Object?",
            bn: "বাক্যটি পড়ুন। Object খুঁজে পেতে কোন প্রশ্নটি করবেন?",
          },
          sentence: "They help their teacher.",
          sentenceGlosses: [
            { text: "They", bn: "তারা" },
            { text: "help", bn: "সাহায্য করে" },
            { text: "their teacher", bn: "তাদের শিক্ষককে" },
          ],
          options: options(
            ["What do they help?", "তারা কী সাহায্য করে?"],
            ["Whom do they help?", "তারা কাকে সাহায্য করে?"],
            ["Where do they help?", "তারা কোথায় সাহায্য করে?"],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: {
            en: "The Object here is a person. Which question word do we use for people?",
            bn: "এখানে Object একজন মানুষ। মানুষের জন্য কোন প্রশ্ন ব্যবহার করি?",
          },
          explanation: {
            en: "“Whom do they help?” leads you to “their teacher.” We ask “whom?” for people.",
            bn: "“Whom do they help?” প্রশ্নের উত্তর হলো “their teacher” (তাদের শিক্ষককে)। মানুষের জন্য আমরা “whom?” প্রশ্ন করি।",
          },
        },
        {
          id: "q-object-review-window",
          title: { en: "Find the Complete Object", bn: "পুরো Object খুঁজে বের করুন" },
          prompt: { en: "Read the sentence. What is the complete Object?", bn: "বাক্যটি পড়ুন। পুরো Object কোনটি?" },
          sentence: "I close the bedroom window.",
          sentenceGlosses: [
            { text: "I", bn: "আমি" },
            { text: "close", bn: "বন্ধ করি" },
            { text: "the bedroom window", bn: "শোবার ঘরের জানালাটি" },
          ],
          options: options(
            ["the bedroom", "শোবার ঘরটি"],
            ["window", "জানালা"],
            ["the bedroom window", "শোবার ঘরের জানালাটি"],
          ),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Well done, {name}!", bn: "খুব ভালো, {name}!" },
          hint: { en: "What do I close? Take every word of the answer.", bn: "আমি কী বন্ধ করি? উত্তরের সব শব্দ নিন।" },
          explanation: {
            en: "The complete Object is “the bedroom window”. It has three words.",
            bn: "পুরো Object হলো “the bedroom window”। এটি তিনটি শব্দ নিয়ে গঠিত।",
          },
        },
        {
          id: "q-object-review-grandparents",
          title: { en: "Can an Object Be a Person?", bn: "Object কি মানুষও হতে পারে?" },
          prompt: { en: "Read the sentence. What is the Object?", bn: "বাক্যটি পড়ুন। এখানে Object কোনটি?" },
          sentence: "We visit our grandparents.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "visit", bn: "দেখতে যাই" },
            { text: "our grandparents", bn: "আমাদের দাদা-দাদি/নানা-নানি" },
          ],
          options: options(
            ["We", "আমরা"],
            ["visit", "দেখতে যাই"],
            ["our grandparents", "আমাদের দাদা-দাদি/নানা-নানি"],
          ),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.excellent,
          hint: { en: "Whom do we visit?", bn: "আমরা কাদের দেখতে যাই?" },
          explanation: {
            en: "An Object can be a person or people, not just a thing.",
            bn: "Object কোনো ব্যক্তি বা একাধিক ব্যক্তিকেও বোঝাতে পারে, শুধু বস্তু নয়।",
          },
        },
        {
          id: "q-object-review-laugh",
          title: { en: "Does This Sentence Have an Object?", bn: "এই বাক্যে কি Object আছে?" },
          prompt: { en: "Read the sentence. Which statement is correct?", bn: "বাক্যটি পড়ুন। কোন তথ্যটি সঠিক?" },
          sentence: "The children laugh.",
          sentenceGlosses: [
            { text: "The children", bn: "শিশুরা" },
            { text: "laugh", bn: "হাসে" },
          ],
          options: options(
            ["“The children” is the Object.", "“The children” হলো Object।"],
            ["“laugh” is the Object.", "“laugh” হলো Object।"],
            ["The sentence has no Object.", "বাক্যটিতে কোনো Object নেই।"],
          ),
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: {
            en: "“The children” do the action. Does anything receive it?",
            bn: "“The children” কাজটি করে। কাজটি কি কারও বা কিছুর ওপর হচ্ছে?",
          },
          explanation: {
            en: "The sentence has a Subject and a Verb, but no Object.",
            bn: "বাক্যটিতে Subject ও Verb আছে, কিন্তু Object নেই।",
          },
        },
        {
          id: "q-object-review-school-bags",
          title: { en: "Decode the Whole Sentence", bn: "পুরো বাক্যটি ডিকোড করুন" },
          prompt: {
            en: "Read the sentence. Which part is the Subject, and which part is the Object?",
            bn: "বাক্যটি পড়ুন। কোনটি Subject এবং কোনটি Object?",
          },
          sentence: "My friends carry their school bags.",
          sentenceGlosses: [
            { text: "My friends", bn: "আমার বন্ধুরা" },
            { text: "carry", bn: "বহন করে" },
            { text: "their school bags", bn: "তাদের স্কুলব্যাগগুলো" },
          ],
          options: options(
            ["Subject: My friends, Object: their school bags", "Subject: আমার বন্ধুরা, Object: তাদের স্কুলব্যাগগুলো"],
            ["Subject: carry, Object: My friends", "Subject: বহন করে, Object: আমার বন্ধুরা"],
            ["Subject: their school bags, Object: carry", "Subject: তাদের স্কুলব্যাগগুলো, Object: বহন করে"],
          ),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.great,
          hint: { en: "Who carries? What do they carry?", bn: "কারা বহন করে? তারা কী বহন করে?" },
          explanation: {
            en: "“My friends” tells us who does the action, and “their school bags” is the complete Object.",
            bn: "“My friends” দিয়ে বোঝায় কারা কাজটি করছে, আর “their school bags” হলো পুরো Object।",
          },
        },
        {
          id: "q-object-review-him",
          title: { en: "Mirror Word", bn: "রূপ বদলান" },
          prompt: {
            en: "Mina helps ___. (her brother)",
            bn: "Mina helps ___. (মিনা তার ভাইকে সাহায্য করে।) শূন্যস্থানে কোনটি বসবে?",
          },
          options: options(["he"], ["him"], ["his"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "A brother is a boy. The blank is after the Verb.", bn: "ভাই ছেলে। শূন্যস্থানটি Verb-এর পরে।" },
          explanation: { en: "After the Verb, “he” becomes “him”.", bn: "Verb-এর পরে “he” হয়ে যায় “him”।" },
        },
        {
          id: "q-object-review-field",
          title: { en: "Object or Place?", bn: "Object, নাকি স্থান?" },
          prompt: { en: "Read the sentence. Which statement is correct?", bn: "বাক্যটি পড়ুন। কোন তথ্যটি সঠিক?" },
          sentence: "We play in the field.",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "play", bn: "খেলি" },
            { text: "in the field", bn: "মাঠে" },
          ],
          options: options(
            ["The Object is “the field.”", "Object হলো “the field”।"],
            ["The Object is “We.”", "Object হলো “We”।"],
            ["There is no Object. “in the field” is a place.", "Object নেই। “in the field” হলো স্থান।"],
          ),
          correctOptionId: "c",
          praise: { en: "Mission mastered!", bn: "মিশন সম্পন্ন!" },
          hint: { en: "Does “in the field” tell what, or where?", bn: "“in the field” কি বলে কী, নাকি কোথায়?" },
          explanation: {
            en: "“in the field” tells us where. It is a place, not an Object.",
            bn: "“in the field” বলে কোথায়। এটি স্থান, Object নয়।",
          },
        },
      ],
    },
    {
      id: "object-complete",
      title: { en: "Step Complete!", bn: "ধাপ শেষ!" },
      messages: [
        {
          en: "{name}, you can now identify an Object, find it by asking **“what?”** or **“whom?”**, recognize an Object with several words, tell an Object from a place, and use **me, him, her, us, them** after the Verb.",
          bn: "{name}, এখন আপনি Object চিহ্নিত করতে, “কী?” বা “কাকে?” প্রশ্ন করে Object খুঁজে বের করতে, একাধিক শব্দের Object চিনতে, Object আর স্থানের পার্থক্য বুঝতে এবং Verb-এর পরে me, him, her, us, them ব্যবহার করতে পারবেন।",
        },
        {
          en: "Next up: **Word Order**. Let's build full sentences!",
          bn: "এরপর: Word Order। চলুন, পুরো বাক্য তৈরি করি!",
        },
      ],
      questions: [],
    },
  ],
};
