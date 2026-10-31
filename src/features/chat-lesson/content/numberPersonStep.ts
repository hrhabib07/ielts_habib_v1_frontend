import type { ChatLessonStep, LessonChunk, LessonOption } from "@/src/features/chat-lesson/types";
// Relative `.ts` import so the Node audio/export scripts can load this file directly.
import { options, PRAISE, table } from "./helpers.ts";

type NumberKey = "singular" | "plural";
type PersonKey = "first" | "second" | "third";

const NUMBER_BN: Record<NumberKey, [string, string]> = {
  singular: ["Singular", "একবচন"],
  plural: ["Plural", "বহুবচন"],
};

const PERSON_BN: Record<PersonKey, [string, string]> = {
  first: ["First Person", "প্রথম পুরুষ"],
  second: ["Second Person", "দ্বিতীয় পুরুষ"],
  third: ["Third Person", "তৃতীয় পুরুষ"],
};

/** "Plural, First Person" style options, in display order. */
const DECODES = (...pairs: [NumberKey, PersonKey][]): LessonOption[] =>
  options(
    ...pairs.map(([number, person]): [string, string] => [
      `${NUMBER_BN[number][0]}, ${PERSON_BN[person][0]}`,
      `${NUMBER_BN[number][1]}, ${PERSON_BN[person][1]}`,
    ]),
  );

/** Replaced by the Number & Person Playground; its He, She, It, They part now ends the Person lesson. */
export const NUMBER_PERSON_STEP: ChatLessonStep = {
  id: "level-1-step-6-number-person",
  missionLabel: "Level 1",
  stepLabel: "Step 6",
  title: { en: "Decode the Subject", bn: "Subject-এর Number ও Person চিহ্নিত করুন" },
  guideName: "Gamlish",
  status: "draft",
  chunks: [
    {
      id: "quick-decode",
      title: { en: "Quick Decode", bn: "দ্রুত চিহ্নিত করুন" },
      messages: [
        {
          en: "{name}, welcome, Subject Decoder! You have already learned how to identify **Number** and **Person**. Now, it is time to bring these two skills together!",
          bn: "{name}, স্বাগতম, Subject Decoder! আপনি ইতোমধ্যে Number এবং Person চিহ্নিত করতে শিখেছেন। এবার এই দুটি বিষয় একসঙ্গে ব্যবহার করার পালা!",
        },
        {
          en: "Think of yourself as a detective. Every Subject gives you **two important clues**. Your job is to discover both clues and decode the Subject correctly.",
          bn: "নিজেকে একজন গোয়েন্দা হিসেবে ভাবুন। প্রতিটি Subject-এর মধ্যে দুটি গুরুত্বপূর্ণ সূত্র আছে। আপনার কাজ হলো সূত্র দুটি খুঁজে বের করে Subject-কে সঠিকভাবে চিহ্নিত করা।",
        },
        {
          en: "**Clue 1: Number**",
          bn: "সূত্র 1: Number",
          items: [
            { term: "Singular", termBn: "একবচন", en: "One person or thing", bn: "একজন ব্যক্তি বা একটি বস্তু" },
            { term: "Plural", termBn: "বহুবচন", en: "More than one person or thing", bn: "একাধিক ব্যক্তি বা বস্তু" },
          ],
        },
        {
          en: "**Clue 2: Person**",
          bn: "সূত্র 2: Person",
          items: [
            { term: "First Person", termBn: "প্রথম পুরুষ", en: "The speaker", bn: "যে কথা বলছে" },
            {
              term: "Second Person",
              termBn: "দ্বিতীয় পুরুষ",
              en: "The person or people being spoken to",
              bn: "যার বা যাদের সঙ্গে কথা বলা হচ্ছে",
            },
            {
              term: "Third Person",
              termBn: "তৃতীয় পুরুষ",
              en: "The person or thing being talked about",
              bn: "যে ব্যক্তি বা বস্তু সম্পর্কে কথা বলা হচ্ছে",
            },
          ],
        },
        {
          variant: "remember",
          en: "Your challenge is simple: find the **Subject**, identify its **Number**, and identify its **Person**.",
          bn: "আপনার কাজ সহজ: Subject খুঁজে বের করুন, তার Number চিহ্নিত করুন এবং Person চিহ্নিত করুন।",
        },
        {
          en: "Let's warm up with a few familiar Subjects. Look at both clues before choosing your answer. Ready? Let's play!",
          bn: "চলুন, পরিচিত কয়েকটি Subject দিয়ে শুরু করি। উত্তর দেওয়ার আগে দুটি সূত্রই ভালোভাবে খেয়াল করুন। প্রস্তুত? চলুন, খেলা শুরু করি!",
        },
      ],
      questions: [
        {
          id: "q-np-we-can-win",
          title: { en: "Your Team Is Ready!", bn: "আপনার দল প্রস্তুত!" },
          prompt: {
            en: "You say this to your team. What are the Number and Person of “We”?",
            bn: "আপনি আপনার দলকে এই কথাটি বললেন। এখানে “We”-এর Number এবং Person কী?",
          },
          sentence: "We can win!",
          sentenceGlosses: [
            { text: "We", bn: "আমরা" },
            { text: "can", bn: "পারি" },
            { text: "win", bn: "জিততে" },
          ],
          options: DECODES(["singular", "first"], ["plural", "first"], ["plural", "third"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: { en: "Great start!", bn: "দারুণ শুরু!" },
          hint: {
            en: "Does “We” include you, the speaker? Is it one person or more?",
            bn: "“We”-তে কি আপনি নিজে আছেন? এটা কি একজন, নাকি একাধিক?",
          },
          explanation: {
            en: "“We” includes the speaker and at least one other person. That makes it Plural and First Person.",
            bn: "“We” বলতে যে কথা বলছে, সে এবং অন্তত আরও একজনকে বোঝায়। তাই এটি Plural এবং First Person।",
          },
        },
        {
          id: "q-np-you-one-friend",
          title: { en: "One Friend or Many?", bn: "একজন বন্ধু, নাকি অনেকজন?" },
          prompt: {
            en: "You are speaking to one friend and say this. What are the Number and Person of “You”?",
            bn: "আপনি একজন বন্ধুর সঙ্গে কথা বলছেন এবং এই কথাটি বললেন। এখানে “You”-এর Number এবং Person কী?",
          },
          sentence: "You can join us!",
          sentenceGlosses: [
            { text: "You", bn: "তুমি" },
            { text: "can", bn: "পারো" },
            { text: "join", bn: "যোগ দিতে" },
            { text: "us", bn: "আমাদের সঙ্গে" },
          ],
          options: DECODES(["singular", "second"], ["singular", "first"], ["plural", "third"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: {
            en: "You are talking to just one friend.",
            bn: "আপনি শুধু একজন বন্ধুর সঙ্গে কথা বলছেন।",
          },
          explanation: {
            en: "You are speaking to one person. Here, “You” is Singular and Second Person.",
            bn: "এখানে একজনের সঙ্গে কথা বলা হচ্ছে। তাই এই বাক্যে “You” হলো Singular এবং Second Person।",
          },
        },
      ],
    },
    {
      id: "spot-the-clues",
      title: { en: "Spot the Clues", bn: "সূত্র খুঁজে বের করুন" },
      messages: [
        {
          en: "Now, {name}, let's look at Subjects that refer to other people and things.",
          bn: "{name}, এবার অন্য ব্যক্তি ও বস্তু বোঝায় এমন Subject দেখি।",
        },
        {
          variant: "remember",
          en: "**Number** tells you how many. **Person** tells you who or what the Subject refers to.",
          bn: "Number দিয়ে বোঝা যায় কয়জন বা কয়টি, আর Person দিয়ে বোঝা যায় কার বা কিসের সম্পর্কে কথা বলা হচ্ছে।",
        },
      ],
      questions: [
        {
          id: "q-np-the-players",
          title: { en: "Meet the Players!", bn: "খেলোয়াড়দের সঙ্গে পরিচিত হোন!" },
          prompt: {
            en: "Your game shows this Subject. What are its Number and Person?",
            bn: "আপনার গেমে এই Subject দেখানো হলো। এর Number এবং Person কী?",
          },
          sentence: "The players",
          sentenceGlosses: [{ text: "The players", bn: "খেলোয়াড়রা" }],
          options: DECODES(["singular", "third"], ["plural", "third"], ["plural", "first"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: { en: "Nice work!", bn: "চমৎকার!" },
          hint: {
            en: "Players: one or many? Are they speaking, or being talked about?",
            bn: "Players কি একজন, নাকি অনেকজন? তারা কি কথা বলছে, নাকি তাদের নিয়ে কথা হচ্ছে?",
          },
          explanation: {
            en: "“The players” refers to more than one person being talked about. It is Plural and Third Person.",
            bn: "“The players” বলতে একাধিক ব্যক্তিকে বোঝায়, যাদের সম্পর্কে কথা বলা হচ্ছে। তাই এটি Plural এবং Third Person।",
          },
        },
        {
          id: "q-np-rafi",
          title: { en: "Meet Rafi!", bn: "Rafi-র সঙ্গে পরিচিত হোন!" },
          prompt: {
            en: "A character named Rafi appears on your screen. Decode the Subject.",
            bn: "আপনার স্ক্রিনে Rafi নামের একটি চরিত্র দেখা গেল। Subject-টি চিহ্নিত করুন।",
          },
          sentence: "Rafi",
          sentenceGlosses: [{ text: "Rafi", bn: "রাফি" }],
          options: DECODES(["singular", "first"], ["plural", "third"], ["singular", "third"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.excellent,
          hint: {
            en: "Rafi is one character, and we are talking about him.",
            bn: "Rafi একজনই, আর আমরা তাকে নিয়ে কথা বলছি।",
          },
          explanation: {
            en: "Rafi is one person being talked about. The Subject is Singular and Third Person.",
            bn: "Rafi একজন ব্যক্তি, যার সম্পর্কে কথা বলা হচ্ছে। তাই Subject-টি Singular এবং Third Person।",
          },
        },
      ],
    },
    {
      id: "decode-pronouns",
      title: { en: "Decode He, She, It and They", bn: "He, She, It এবং They চিহ্নিত করুন" },
      messages: [
        {
          en: "**He**, **She** and **It** always mean one. **They** always means more than one. A thing is Third Person too.",
          bn: "He, She এবং It সবসময় একজন বা একটিকে বোঝায়। They সবসময় একাধিককে বোঝায়। কোনো বস্তুও Third Person।",
          table: table(
            [
              { en: "Subject", bn: "Subject" },
              { en: "Number", bn: "Number" },
              { en: "Person", bn: "Person" },
            ],
            [
              ["He / She / It", "Singular", "Third Person"],
              ["They", "Plural", "Third Person"],
              ["My phone", "Singular", "Third Person"],
              ["The fan and the light", "Plural", "Third Person"],
            ],
          ),
        },
      ],
      questions: [
        {
          id: "q-np-she",
          prompt: { en: "Decode the Subject “She”.", bn: "Subject “She”-কে চিহ্নিত করুন।" },
          sentence: "She is my cousin.",
          sentenceGlosses: [
            { text: "She", bn: "সে (মেয়ে)" },
            { text: "my cousin", bn: "আমার কাজিন" },
          ],
          options: DECODES(["singular", "third"], ["plural", "third"], ["singular", "first"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: { en: "She is one person, being talked about.", bn: "She একজন, যাকে নিয়ে কথা হচ্ছে।" },
          explanation: { en: "“She” is Singular and Third Person.", bn: "“She” হলো Singular এবং Third Person।" },
        },
        {
          id: "q-np-my-phone",
          prompt: { en: "Decode the Subject “My phone”.", bn: "Subject “My phone”-কে চিহ্নিত করুন।" },
          sentence: "My phone is on the table.",
          sentenceGlosses: [
            { text: "My phone", bn: "আমার ফোন" },
            { text: "on the table", bn: "টেবিলের ওপর" },
          ],
          options: DECODES(["singular", "first"], ["singular", "third"], ["plural", "third"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: {
            en: "“My” tells whose phone. The phone itself is being talked about.",
            bn: "“My” বলে ফোনটি কার। ফোনটিকে নিয়েই কথা হচ্ছে।",
          },
          explanation: {
            en: "One phone, being talked about: Singular and Third Person. “My” does not make it First Person.",
            bn: "একটি ফোন, যার সম্পর্কে কথা হচ্ছে: Singular এবং Third Person। “My” থাকলেই First Person হয় না।",
          },
        },
        {
          id: "q-np-they",
          prompt: { en: "Decode the Subject “They”.", bn: "Subject “They”-কে চিহ্নিত করুন।" },
          sentence: "They are my classmates.",
          sentenceGlosses: [
            { text: "They", bn: "তারা" },
            { text: "my classmates", bn: "আমার সহপাঠীরা" },
          ],
          options: DECODES(["plural", "first"], ["singular", "third"], ["plural", "third"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: { en: "They: one or many? Speaking, or talked about?", bn: "They: একজন, নাকি অনেকজন? বলছে, নাকি তাদের নিয়ে বলা হচ্ছে?" },
          explanation: { en: "“They” is Plural and Third Person.", bn: "“They” হলো Plural এবং Third Person।" },
        },
        {
          id: "q-np-fan-light",
          prompt: { en: "Decode the complete Subject.", bn: "পুরো Subject-টি চিহ্নিত করুন।" },
          sentence: "The fan and the light are on.",
          sentenceGlosses: [
            { text: "The fan", bn: "ফ্যানটি" },
            { text: "and", bn: "এবং" },
            { text: "the light", bn: "লাইটটি" },
            { text: "are on", bn: "চালু আছে" },
          ],
          options: DECODES(["singular", "third"], ["plural", "third"], ["plural", "first"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.excellent,
          hint: { en: "How many things are joined with “and”?", bn: "“and” দিয়ে কয়টি জিনিস যুক্ত হয়েছে?" },
          explanation: {
            en: "Two things joined with “and” make the Subject Plural. They are being talked about, so Third Person.",
            bn: "“and” দিয়ে দুটি জিনিস যুক্ত হওয়ায় Subject-টি Plural। এদের নিয়ে কথা হচ্ছে, তাই Third Person।",
          },
        },
      ],
    },
    {
      id: "longer-subjects",
      title: { en: "Decode Longer Subjects", bn: "বড় Subject চিহ্নিত করুন" },
      messages: [
        {
          en: "Ready for the next step? Sometimes, a Subject contains **several words**.",
          bn: "পরের ধাপের জন্য প্রস্তুত? কখনো কখনো একটি Subject-এ একাধিক শব্দ থাকে।",
        },
        {
          variant: "remember",
          en: "Do not focus on only the first word. Look at the **complete Subject** to understand its Number and Person.",
          bn: "শুধু প্রথম শব্দটির দিকে খেয়াল করবেন না। Number এবং Person বোঝার জন্য পুরো Subject-টি ভালোভাবে দেখুন।",
        },
      ],
      questions: [
        {
          id: "q-np-ayesha-and-i",
          title: { en: "Two Clues, One Subject!", bn: "দুটি সূত্র, একটি Subject!" },
          prompt: {
            en: "Read the sentence. What are the Number and Person of “Ayesha and I”?",
            bn: "বাক্যটি পড়ুন। এখানে “Ayesha and I”-এর Number এবং Person কী?",
          },
          sentence: "Ayesha and I wash the dishes.",
          sentenceGlosses: [
            { text: "Ayesha", bn: "আয়েশা" },
            { text: "and", bn: "এবং" },
            { text: "I", bn: "আমি" },
            { text: "wash", bn: "ধুই" },
            { text: "the dishes", bn: "থালাবাসন" },
          ],
          options: DECODES(["singular", "first"], ["plural", "first"], ["plural", "third"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: { en: "Well done!", bn: "খুব ভালো!" },
          hint: {
            en: "Count the people. Is “I” in the Subject?",
            bn: "কয়জন আছে গুনে দেখুন। Subject-এ কি “I” আছে?",
          },
          explanation: {
            en: "The Subject includes the speaker and another person. It is Plural and First Person.",
            bn: "Subject-টিতে যে কথা বলছে, সে এবং আরও একজন ব্যক্তি অন্তর্ভুক্ত রয়েছে। তাই এটি Plural এবং First Person।",
          },
        },
        {
          id: "q-np-my-sisters",
          title: { en: "My Sisters Read Books!", bn: "আমার বোনেরা বই পড়ে!" },
          prompt: {
            en: "Read the sentence. What are the Number and Person of “My sisters”?",
            bn: "বাক্যটি পড়ুন। এখানে “My sisters”-এর Number এবং Person কী?",
          },
          sentence: "My sisters read books.",
          sentenceGlosses: [
            { text: "My sisters", bn: "আমার বোনেরা" },
            { text: "read", bn: "পড়ে" },
            { text: "books", bn: "বই" },
          ],
          options: DECODES(["plural", "third"], ["singular", "third"], ["plural", "first"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.excellent,
          hint: {
            en: "Look at the “s” in “sisters”. Is the speaker inside the Subject?",
            bn: "“sisters”-এর শেষে “s” খেয়াল করুন। Subject-এর মধ্যে কি বক্তা আছে?",
          },
          explanation: {
            en: "“My sisters” refers to more than one person being talked about. So, it is Plural and Third Person.",
            bn: "“My sisters” বলতে একাধিক ব্যক্তিকে বোঝায়, যাদের সম্পর্কে কথা বলা হচ্ছে। তাই এটি Plural এবং Third Person।",
          },
        },
        {
          id: "q-np-students-in-class",
          title: { en: "Look Beyond the First Word", bn: "প্রথম শব্দের পরেও দেখুন" },
          prompt: {
            en: "Read the sentence. Decode the complete Subject: “The students in our class”.",
            bn: "বাক্যটি পড়ুন। পুরো Subject-টি চিহ্নিত করুন: “The students in our class”।",
          },
          sentence: "The students in our class play football.",
          sentenceGlosses: [
            { text: "The students", bn: "শিক্ষার্থীরা" },
            { text: "in our class", bn: "আমাদের ক্লাসের" },
            { text: "play", bn: "খেলে" },
            { text: "football", bn: "ফুটবল" },
          ],
          options: DECODES(["singular", "third"], ["plural", "first"], ["plural", "third"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Great thinking!", bn: "দারুণ!" },
          hint: {
            en: "The main word is “students”. Don't let “our” trick you.",
            bn: "মূল শব্দ “students”। “our” দেখে বিভ্রান্ত হবেন না।",
          },
          explanation: {
            en: "The Subject refers to several students who are being talked about. The extra words give more information, but the Subject stays Plural and Third Person.",
            bn: "Subject-টি একাধিক শিক্ষার্থীকে বোঝায়, যাদের সম্পর্কে কথা বলা হচ্ছে। অতিরিক্ত শব্দগুলো আরও তথ্য দেয়, কিন্তু Subject-টি Plural এবং Third Person-ই থাকে।",
          },
        },
        {
          id: "q-np-you-whole-team",
          title: { en: "Who Are You Speaking To?", bn: "আপনি কার সঙ্গে কথা বলছেন?" },
          prompt: {
            en: "You are speaking to your whole team and say this. What are the Number and Person of “You”?",
            bn: "আপনি আপনার পুরো দলের সঙ্গে কথা বলছেন এবং এই কথাটি বললেন। এখানে “You”-এর Number এবং Person কী?",
          },
          sentence: "You can join our team!",
          sentenceGlosses: [
            { text: "You", bn: "তোমরা" },
            { text: "can", bn: "পারো" },
            { text: "join", bn: "যোগ দিতে" },
            { text: "our team", bn: "আমাদের দলে" },
          ],
          options: DECODES(["plural", "second"], ["plural", "first"], ["singular", "second"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.excellent,
          hint: {
            en: "You are talking to the whole team, not one person.",
            bn: "আপনি পুরো দলের সঙ্গে কথা বলছেন, একজনের সঙ্গে নয়।",
          },
          explanation: {
            en: "You are speaking to several people. “You” is Plural here, but its Person stays Second Person.",
            bn: "এখানে একাধিক ব্যক্তির সঙ্গে কথা বলা হচ্ছে। তাই “You” এখানে Plural, তবে Person হিসেবে এটি Second Person-ই থাকে।",
          },
        },
      ],
    },
    {
      id: "find-the-subject",
      title: { en: "Find the Subject First", bn: "আগে Subject খুঁজে বের করুন" },
      messages: [
        {
          en: "Now, let's make things a little more interesting!",
          bn: "এবার চ্যালেঞ্জটি একটু বাড়ানো যাক!",
        },
        {
          en: "This time, the Subject will not be shown to you. Read the whole sentence, **find the Subject**, and then identify its Number and Person.",
          bn: "এইবার Subject আলাদা করে দেখিয়ে দেওয়া হবে না। পুরো বাক্যটি পড়ুন, নিজে Subject খুঁজে বের করুন, তারপর তার Number এবং Person চিহ্নিত করুন।",
        },
      ],
      questions: [
        {
          id: "q-np-books-on-desk",
          title: { en: "The Books on My Desk", bn: "আমার ডেস্কের বইগুলো" },
          prompt: {
            en: "Read the sentence. Which option correctly identifies the Subject, its Number and its Person?",
            bn: "বাক্যটি পড়ুন। কোন বিকল্পে Subject, তার Number এবং Person সঠিকভাবে চিহ্নিত করা হয়েছে?",
          },
          sentence: "The books on my desk are new.",
          sentenceGlosses: [
            { text: "The books", bn: "বইগুলো" },
            { text: "on my desk", bn: "আমার ডেস্কের ওপরের" },
            { text: "are", bn: "হয়" },
            { text: "new", bn: "নতুন" },
          ],
          options: options(
            ["My desk, Singular, First Person", "My desk, একবচন, প্রথম পুরুষ"],
            ["The books on my desk, Plural, Third Person", "The books on my desk, বহুবচন, তৃতীয় পুরুষ"],
            ["The books, Singular, Third Person", "The books, একবচন, তৃতীয় পুরুষ"],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: { en: "You found it, {name}!", bn: "পেয়ে গেছেন, {name}!" },
          hint: {
            en: "What is new? Take every word that answers it.",
            bn: "কোন জিনিসগুলো নতুন? উত্তরের সব শব্দ নিন।",
          },
          explanation: {
            en: "The sentence talks about the books. There is more than one book, and the books are being talked about. So, the Subject is Plural and Third Person.",
            bn: "বাক্যটিতে বইগুলোর সম্পর্কে কথা বলা হচ্ছে। বই একাধিক, এবং সেগুলো সম্পর্কে কথা বলা হচ্ছে। তাই Subject-টি Plural এবং Third Person।",
          },
        },
        {
          id: "q-np-brother-cousin-and-i",
          title: { en: "Three People, One Subject!", bn: "তিনজন, একটি Subject!" },
          prompt: {
            en: "Read the sentence. What are the Number and Person of the complete Subject?",
            bn: "বাক্যটি পড়ুন। পুরো Subject-এর Number এবং Person কী?",
          },
          sentence: "My brother, my cousin, and I clean our room.",
          sentenceGlosses: [
            { text: "My brother", bn: "আমার ভাই" },
            { text: "my cousin", bn: "আমার কাজিন" },
            { text: "and", bn: "এবং" },
            { text: "I", bn: "আমি" },
            { text: "clean", bn: "পরিষ্কার করি" },
            { text: "our room", bn: "আমাদের ঘর" },
          ],
          options: DECODES(["plural", "third"], ["singular", "first"], ["plural", "first"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Fantastic!", bn: "অসাধারণ!" },
          hint: {
            en: "Count everyone in the Subject. Is “I” there?",
            bn: "Subject-এ সবাইকে গুনে দেখুন। সেখানে কি “I” আছে?",
          },
          explanation: {
            en: "The Subject includes three people, including the speaker. That makes it Plural and First Person.",
            bn: "Subject-টিতে যে কথা বলছে, সে-সহ মোট তিনজন ব্যক্তি রয়েছে। তাই এটি Plural এবং First Person।",
          },
        },
      ],
    },
    {
      id: "pattern-master",
      title: { en: "Bonus: Pattern Master", bn: "বোনাস: Pattern Master" },
      messages: [
        {
          en: "{name}, want to go one step further? This bonus challenge is a little harder. There is no rush. Think carefully and enjoy it!",
          bn: "{name}, আরও এক ধাপ এগিয়ে যেতে চান? এই বোনাস চ্যালেঞ্জটি একটু কঠিন। তাড়াহুড়ো করার দরকার নেই। ভালোভাবে ভেবে উত্তর দিন এবং চ্যালেঞ্জটি উপভোগ করুন!",
        },
      ],
      questions: [
        {
          id: "q-np-you-and-your-friend",
          title: { en: "The Complete Decode", bn: "পুরো Subject ডিকোড করুন" },
          prompt: {
            en: "First, find the complete Subject. Then decode its Number and Person.",
            bn: "প্রথমে পুরো Subject খুঁজে বের করুন। তারপর এর Number এবং Person চিহ্নিত করুন।",
          },
          sentence: "You and your friend can join our team.",
          sentenceGlosses: [
            { text: "You", bn: "তুমি" },
            { text: "and", bn: "এবং" },
            { text: "your friend", bn: "তোমার বন্ধু" },
            { text: "can", bn: "পারো" },
            { text: "join", bn: "যোগ দিতে" },
            { text: "our team", bn: "আমাদের দলে" },
          ],
          options: DECODES(["plural", "second"], ["plural", "first"], ["singular", "second"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: { en: "Mission mastered!", bn: "মিশন জয় করেছেন!" },
          hint: {
            en: "“You” is in the Subject, but “I” is not.",
            bn: "Subject-এ “You” আছে, কিন্তু “I” নেই।",
          },
          explanation: {
            en: "The Subject refers to the people being spoken to. There is more than one person, so it is Plural and Second Person.",
            bn: "Subject-টি যাদের সঙ্গে কথা বলা হচ্ছে, তাদের বোঝায়। এখানে একাধিক ব্যক্তি রয়েছে। তাই এটি Plural এবং Second Person।",
          },
        },
        {
          id: "q-np-group-b",
          title: { en: "Who Is in Group B?", bn: "গ্রুপ B-তে কারা?" },
          prompt: {
            en: "First, find the complete Subject. Then decode its Number and Person.",
            bn: "প্রথমে পুরো Subject খুঁজে বের করুন। তারপর এর Number এবং Person চিহ্নিত করুন।",
          },
          sentence: "Mina, Sadia and you are in Group B.",
          sentenceGlosses: [
            { text: "Mina", bn: "মিনা" },
            { text: "Sadia", bn: "সাদিয়া" },
            { text: "and", bn: "এবং" },
            { text: "you", bn: "তুমি" },
            { text: "are in Group B", bn: "গ্রুপ B-তে আছ" },
          ],
          options: DECODES(["plural", "third"], ["plural", "second"], ["singular", "second"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.excellent,
          hint: { en: "Is there an “I”? Is there a “You”?", bn: "“I” আছে কি? “You” আছে কি?" },
          explanation: {
            en: "“You” is in the Subject and “I” is not, so it is Second Person. Three people make it Plural.",
            bn: "Subject-এ “You” আছে কিন্তু “I” নেই, তাই Second Person। তিনজন থাকায় এটি Plural।",
          },
        },
        {
          id: "q-np-water-bottle",
          title: { en: "A Tricky One!", bn: "একটু কঠিন!" },
          prompt: {
            en: "Decode the complete Subject.",
            bn: "পুরো Subject-টি চিহ্নিত করুন।",
          },
          sentence: "The water in this bottle is cold.",
          sentenceGlosses: [
            { text: "The water", bn: "পানি" },
            { text: "in this bottle", bn: "এই বোতলের" },
            { text: "is", bn: "হয়" },
            { text: "cold", bn: "ঠান্ডা" },
          ],
          options: DECODES(["plural", "third"], ["singular", "first"], ["singular", "third"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Mission mastered, {name}!", bn: "মিশন জয় করেছেন, {name}!" },
          hint: {
            en: "Remember: water has no Plural.",
            bn: "মনে রাখুন: water-এর কোনো Plural নেই।",
          },
          explanation: {
            en: "Water has no Plural, so it is Singular. It is being talked about, so Third Person.",
            bn: "Water-এর কোনো Plural নেই, তাই এটি Singular। একে নিয়ে কথা হচ্ছে, তাই Third Person।",
          },
        },
      ],
    },
    {
      id: "decoder-guide",
      title: { en: "Your Decoder's Quick Guide", bn: "Subject চিহ্নিত করার সহজ নিয়ম" },
      messages: [
        {
          en: "Use this guide whenever you need a little help.",
          bn: "কোনো প্রশ্নে আটকে গেলে এই নির্দেশিকাটি ব্যবহার করুন।",
          table: table(
            [
              { en: "Subject", bn: "Subject" },
              { en: "Number", bn: "Number" },
              { en: "Person", bn: "Person" },
            ],
            [
              ["I", "Singular", "First Person"],
              ["We", "Plural", "First Person"],
              [{ en: "You (to one person)", bn: "You (একজনকে বললে)" }, "Singular", "Second Person"],
              [{ en: "You (to a group)", bn: "You (অনেকজনকে বললে)" }, "Plural", "Second Person"],
              ["He / She / It", "Singular", "Third Person"],
              ["They", "Plural", "Third Person"],
              ["My brother and I", "Plural", "First Person"],
              ["You and your friend", "Plural", "Second Person"],
              ["Rafi", "Singular", "Third Person"],
              ["The students in our class", "Plural", "Third Person"],
              ["The books on my desk", "Plural", "Third Person"],
            ],
          ),
        },
        {
          variant: "remember",
          en: "Remember these three rules:",
          bn: "এই তিনটি নিয়ম মনে রাখবেন:",
          items: [
            {
              term: "Rule 1",
              termBn: "নিয়ম 1",
              en: "Number tells you how many. Singular means one. Plural means more than one.",
              bn: "Number দিয়ে বোঝা যায় কয়জন বা কয়টি। Singular মানে একজন বা একটি। Plural মানে একাধিক।",
            },
            {
              term: "Rule 2",
              termBn: "নিয়ম 2",
              en: "Person tells you who or what the Subject refers to. First Person includes the speaker. Second Person is the person or people being spoken to. Third Person is the person or thing being talked about.",
              bn: "Person দিয়ে বোঝা যায় Subject কার বা কিসের সম্পর্কে বলছে। First Person-এ যে কথা বলছে, সে অন্তর্ভুক্ত থাকে। Second Person বলতে যার বা যাদের সঙ্গে কথা বলা হচ্ছে, তাদের বোঝায়। Third Person বলতে যে ব্যক্তি বা বস্তু সম্পর্কে কথা বলা হচ্ছে, তাকে বোঝায়।",
            },
            {
              term: "Rule 3",
              termBn: "নিয়ম 3",
              en: "Always check the complete Subject. Extra words may give more information. Do not decide the Number or Person by looking at only one word.",
              bn: "সব সময় পুরো Subject খেয়াল করবেন। অতিরিক্ত শব্দ আরও তথ্য দিতে পারে। শুধু একটি শব্দ দেখে Number বা Person নির্ধারণ করবেন না।",
            },
          ],
        },
        {
          en: "Wonderful work, Subject Decoder! You have practiced finding Number and Person, decoding longer Subjects, and finding the Subject in complete sentences.",
          bn: "দারুণ কাজ করেছেন, Subject Decoder! আপনি Number ও Person চিহ্নিত করা, বড় Subject বিশ্লেষণ করা এবং পুরো বাক্য থেকে Subject খুঁজে বের করার অনুশীলন করেছেন।",
        },
        {
          en: "Next up: **Verb**. {name}, let's put your grammar skills into action!",
          bn: "এরপর: Verb। চলুন {name}, আপনার গ্রামার দক্ষতা কাজে লাগাই!",
        },
      ],
      questions: [],
    },
  ],
};

/** "Decode He, She, It and They": the part the Person lesson keeps from this step. */
export const DECODE_PRONOUNS_CHUNK: LessonChunk | undefined = NUMBER_PERSON_STEP.chunks.find(
  (chunk) => chunk.id === "decode-pronouns",
);
