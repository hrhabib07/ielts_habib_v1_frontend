"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Crown,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Zap,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MissionZeroConfetti } from "@/src/components/demo/MissionZeroFx";
import {
  playCelebrateSfx,
  playCorrectEvalSfx,
  playUiClickSfx,
  primeEvalSfx,
} from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

type Role = "subject" | "verb" | "object";

type MappedWord = {
  en: string;
  bn: string;
  role?: Role;
};

type LabQuestion = {
  id: string;
  prompt: string;
  sentence?: string;
  bangla: string;
  options: string[];
  answer: string;
  map: MappedWord[];
  tip: string;
};

type LabQuest = {
  id: string;
  label: string;
  title: string;
  emoji: string;
  tone: string;
  definitionBn: string;
  definitionEn: string;
  rule: string;
  exampleBn: string;
  example: MappedWord[];
  rescue: [string, string, string, string];
  questions: LabQuestion[];
};

const ROLE_STYLES: Record<Role, string> = {
  subject: "border-emerald-500 bg-emerald-100 text-emerald-950",
  verb: "border-sky-500 bg-sky-100 text-sky-950",
  object: "border-amber-500 bg-amber-100 text-amber-950",
};

const ROLE_LABELS: Record<Role, string> = {
  subject: "Subject",
  verb: "Verb",
  object: "Object",
};

const QUESTS: LabQuest[] = [
  {
    id: "subject",
    label: "Quest 1",
    title: "Subject Finder",
    emoji: "🕵️",
    tone: "from-emerald-500 to-teal-600",
    definitionBn: "বাক্যে কে বা কারা কাজটি করে, সেটিই Subject বা কর্তা।",
    definitionEn: "The person or thing doing the action.",
    rule: "কে বা কারা কাজ করছে?",
    exampleBn: "তারা ফুটবল খেলে।",
    example: [
      { en: "They", bn: "তারা", role: "subject" },
      { en: "play", bn: "খেলে", role: "verb" },
      { en: "football", bn: "ফুটবল", role: "object" },
    ],
    rescue: [
      "কাজটি কে করছে, সেটি খুঁজো।",
      "বাক্যের কাজের আগে জিজ্ঞেস করো: কে বা কারা?",
      "Subject সাধারণত ইংরেজি বাক্যের শুরুতে থাকে।",
      "They play football. এখানে খেলার কাজটি They করছে। তাই They হলো Subject।",
    ],
    questions: [
      {
        id: "s1",
        prompt: "Subject কোনটি?",
        sentence: "I sing songs.",
        bangla: "আমি গান গাই।",
        options: ["sing", "songs", "I"],
        answer: "I",
        map: [{ en: "I", bn: "আমি" }, { en: "sing", bn: "গাই" }, { en: "songs", bn: "গান" }],
        tip: "কে গান গায়? I বা আমি।",
      },
      {
        id: "s2",
        prompt: "কাজটি কারা করছে?",
        sentence: "We clean rooms.",
        bangla: "আমরা ঘর পরিষ্কার করি।",
        options: ["rooms", "We", "clean"],
        answer: "We",
        map: [{ en: "We", bn: "আমরা" }, { en: "clean", bn: "পরিষ্কার করি" }, { en: "rooms", bn: "ঘর" }],
        tip: "পরিষ্কারের কাজ We করছে।",
      },
      {
        id: "s3",
        prompt: "Subject খুঁজে বের করো।",
        sentence: "You draw pictures.",
        bangla: "তুমি ছবি আঁকো।",
        options: ["pictures", "draw", "You"],
        answer: "You",
        map: [{ en: "You", bn: "তুমি" }, { en: "draw", bn: "আঁকো" }, { en: "pictures", bn: "ছবি" }],
        tip: "কে ছবি আঁকে? You বা তুমি।",
      },
      {
        id: "s4",
        prompt: "শেষ চেক: Subject কোনটি?",
        sentence: "Farmers plant trees.",
        bangla: "কৃষকরা গাছ লাগায়।",
        options: ["trees", "Farmers", "plant"],
        answer: "Farmers",
        map: [{ en: "Farmers", bn: "কৃষকরা" }, { en: "plant", bn: "লাগায়" }, { en: "trees", bn: "গাছ" }],
        tip: "কারা গাছ লাগায়? Farmers।",
      },
    ],
  },
  {
    id: "verb",
    label: "Quest 2",
    title: "Action Hunter",
    emoji: "⚡",
    tone: "from-sky-500 to-blue-600",
    definitionBn: "যে শব্দ কাজ বোঝায়, সেটিই Verb বা ক্রিয়া।",
    definitionEn: "The action word in a sentence.",
    rule: "কী কাজ হচ্ছে?",
    exampleBn: "ছাত্ররা বই পড়ে।",
    example: [
      { en: "Students", bn: "ছাত্ররা", role: "subject" },
      { en: "read", bn: "পড়ে", role: "verb" },
      { en: "books", bn: "বই", role: "object" },
    ],
    rescue: [
      "বাক্যে কী কাজ হচ্ছে, সেটি খুঁজো।",
      "ধরা, দেখা, পান করা: এগুলো কাজ।",
      "ইংরেজিতে Verb সাধারণত Subject-এর পরে বসে।",
      "They catch fish. এখানে ধরার কাজটি catch। তাই catch হলো Verb।",
    ],
    questions: [
      {
        id: "v1",
        prompt: "Verb কোনটি?",
        sentence: "They catch fish.",
        bangla: "তারা মাছ ধরে।",
        options: ["fish", "They", "catch"],
        answer: "catch",
        map: [{ en: "They", bn: "তারা" }, { en: "catch", bn: "ধরে" }, { en: "fish", bn: "মাছ" }],
        tip: "ধরা একটি কাজ। তাই catch হলো Verb।",
      },
      {
        id: "v2",
        prompt: "কাজ বোঝানো শব্দটি বেছে নাও।",
        sentence: "I wash cars.",
        bangla: "আমি গাড়ি ধুই।",
        options: ["wash", "cars", "I"],
        answer: "wash",
        map: [{ en: "I", bn: "আমি" }, { en: "wash", bn: "ধুই" }, { en: "cars", bn: "গাড়ি" }],
        tip: "ধোয়ার কাজটি wash।",
      },
      {
        id: "v3",
        prompt: "Verb খুঁজে বের করো।",
        sentence: "Children fly kites.",
        bangla: "শিশুরা ঘুড়ি ওড়ায়।",
        options: ["kites", "fly", "Children"],
        answer: "fly",
        map: [{ en: "Children", bn: "শিশুরা" }, { en: "fly", bn: "ওড়ায়" }, { en: "kites", bn: "ঘুড়ি" }],
        tip: "ওড়ানো কাজটি fly বোঝায়।",
      },
      {
        id: "v4",
        prompt: "শেষ চেক: Verb কোনটি?",
        sentence: "Teachers guide students.",
        bangla: "শিক্ষকরা ছাত্রদের পথ দেখান।",
        options: ["students", "Teachers", "guide"],
        answer: "guide",
        map: [{ en: "Teachers", bn: "শিক্ষকরা" }, { en: "guide", bn: "পথ দেখান" }, { en: "students", bn: "ছাত্রদের" }],
        tip: "পথ দেখানোর কাজটি guide।",
      },
    ],
  },
  {
    id: "object",
    label: "Quest 3",
    title: "Object Catcher",
    emoji: "🎯",
    tone: "from-amber-500 to-orange-600",
    definitionBn: "কাজটি কী বা কাকে নিয়ে হচ্ছে, সেটিই Object বা কর্ম।",
    definitionEn: "The receiver of the action.",
    rule: "কী বা কাকে?",
    exampleBn: "আমরা চা বানাই।",
    example: [
      { en: "We", bn: "আমরা", role: "subject" },
      { en: "make", bn: "বানাই", role: "verb" },
      { en: "tea", bn: "চা", role: "object" },
    ],
    rescue: [
      "Verb-এর পরে কী বা কাকে প্রশ্ন করো।",
      "আমরা কী বানাই? চা।",
      "ইংরেজিতে Object সাধারণত Verb-এর পরে থাকে।",
      "We make tea. make কী? tea। তাই tea হলো Object।",
    ],
    questions: [
      {
        id: "o1",
        prompt: "Object কোনটি?",
        sentence: "I write letters.",
        bangla: "আমি চিঠি লিখি।",
        options: ["letters", "I", "write"],
        answer: "letters",
        map: [{ en: "I", bn: "আমি" }, { en: "write", bn: "লিখি" }, { en: "letters", bn: "চিঠি" }],
        tip: "আমি কী লিখি? letters।",
      },
      {
        id: "o2",
        prompt: "কাজটি কিসের ওপর হচ্ছে?",
        sentence: "They buy clothes.",
        bangla: "তারা কাপড় কেনে।",
        options: ["buy", "clothes", "They"],
        answer: "clothes",
        map: [{ en: "They", bn: "তারা" }, { en: "buy", bn: "কেনে" }, { en: "clothes", bn: "কাপড়" }],
        tip: "তারা কী কেনে? clothes।",
      },
      {
        id: "o3",
        prompt: "Object খুঁজে বের করো।",
        sentence: "You pick flowers.",
        bangla: "তুমি ফুল তোলো।",
        options: ["You", "flowers", "pick"],
        answer: "flowers",
        map: [{ en: "You", bn: "তুমি" }, { en: "pick", bn: "তোলো" }, { en: "flowers", bn: "ফুল" }],
        tip: "তুমি কী তোলো? flowers।",
      },
      {
        id: "o4",
        prompt: "শেষ চেক: Object কোনটি?",
        sentence: "People love stories.",
        bangla: "মানুষ গল্প ভালোবাসে।",
        options: ["love", "People", "stories"],
        answer: "stories",
        map: [{ en: "People", bn: "মানুষ" }, { en: "love", bn: "ভালোবাসে" }, { en: "stories", bn: "গল্প" }],
        tip: "মানুষ কী ভালোবাসে? stories।",
      },
    ],
  },
  {
    id: "mix",
    label: "Mini Boss",
    title: "SVO Power Mix",
    emoji: "👑",
    tone: "from-violet-500 to-purple-700",
    definitionBn: "এবার Subject, Verb এবং Object একসাথে চিনব।",
    definitionEn: "Find all three sentence parts.",
    rule: "কে + কী করে + কী বা কাকে",
    exampleBn: "আমরা সমস্যা সমাধান করি।",
    example: [
      { en: "We", bn: "আমরা", role: "subject" },
      { en: "solve", bn: "সমাধান করি", role: "verb" },
      { en: "problems", bn: "সমস্যা", role: "object" },
    ],
    rescue: [
      "প্রথমে কাজটি খুঁজো।",
      "তারপর কে কাজ করছে দেখো।",
      "শেষে কী বা কাকে নিয়ে কাজ হচ্ছে দেখো।",
      "S = কে, V = কী করে, O = কী বা কাকে।",
    ],
    questions: [
      {
        id: "m1",
        prompt: "eat কোন অংশ?",
        sentence: "I eat mangoes.",
        bangla: "আমি আম খাই।",
        options: ["Subject", "Object", "Verb"],
        answer: "Verb",
        map: [{ en: "I", bn: "আমি" }, { en: "eat", bn: "খাই" }, { en: "mangoes", bn: "আম" }],
        tip: "eat কাজ বোঝায়। তাই এটি Verb।",
      },
      {
        id: "m2",
        prompt: "They কোন অংশ?",
        sentence: "They bring bags.",
        bangla: "তারা ব্যাগ আনে।",
        options: ["Verb", "Subject", "Object"],
        answer: "Subject",
        map: [{ en: "They", bn: "তারা" }, { en: "bring", bn: "আনে" }, { en: "bags", bn: "ব্যাগ" }],
        tip: "They কাজটি করছে। তাই এটি Subject।",
      },
      {
        id: "m3",
        prompt: "rivers কোন অংশ?",
        sentence: "You cross rivers.",
        bangla: "তুমি নদী পার হও।",
        options: ["Object", "Verb", "Subject"],
        answer: "Object",
        map: [{ en: "You", bn: "তুমি" }, { en: "cross", bn: "পার হও" }, { en: "rivers", bn: "নদী" }],
        tip: "তুমি কী পার হও? rivers। তাই Object।",
      },
      {
        id: "m4",
        prompt: "books কোন অংশ?",
        sentence: "Friends share books.",
        bangla: "বন্ধুরা বই ভাগ করে।",
        options: ["Verb", "Object", "Subject"],
        answer: "Object",
        map: [{ en: "Friends", bn: "বন্ধুরা" }, { en: "share", bn: "ভাগ করে" }, { en: "books", bn: "বই" }],
        tip: "বন্ধুরা কী ভাগ করে? books।",
      },
    ],
  },
  {
    id: "number",
    label: "Quest 4",
    title: "One or Many?",
    emoji: "🔢",
    tone: "from-pink-500 to-rose-600",
    definitionBn: "বাংলায় একজন হলে ইংরেজিতেও Singular। একের বেশি হলে দুই ভাষাতেই Plural।",
    definitionEn: "Singular means one. Plural means more than one.",
    rule: "একজন = Singular · একের বেশি = Plural",
    exampleBn: "আমি ফল খাই। · তারা ফল খায়।",
    example: [
      { en: "I", bn: "আমি · একজন", role: "subject" },
      { en: "They", bn: "তারা · একের বেশি", role: "subject" },
    ],
    rescue: [
      "Subject একজন নাকি একের বেশি দেখো।",
      "I মানে আমি, তাই একজন।",
      "We বা They মানে একের বেশি।",
      "ধারণাটি দুই ভাষাতেই একই: একজন Singular, অনেকজন Plural।",
    ],
    questions: [
      {
        id: "n1",
        prompt: "We: Singular না Plural?",
        sentence: "We open windows.",
        bangla: "আমরা জানালা খুলি।",
        options: ["Singular", "Plural"],
        answer: "Plural",
        map: [{ en: "We", bn: "আমরা" }, { en: "open", bn: "খুলি" }, { en: "windows", bn: "জানালা" }],
        tip: "We মানে আমরা, অর্থাৎ একের বেশি।",
      },
      {
        id: "n2",
        prompt: "I: Singular না Plural?",
        sentence: "I start games.",
        bangla: "আমি খেলা শুরু করি।",
        options: ["Plural", "Singular"],
        answer: "Singular",
        map: [{ en: "I", bn: "আমি" }, { en: "start", bn: "শুরু করি" }, { en: "games", bn: "খেলা" }],
        tip: "I মানে আমি, অর্থাৎ একজন।",
      },
      {
        id: "n3",
        prompt: "Boys: Singular না Plural?",
        sentence: "Boys play cricket.",
        bangla: "ছেলেরা ক্রিকেট খেলে।",
        options: ["Singular", "Plural"],
        answer: "Plural",
        map: [{ en: "Boys", bn: "ছেলেরা" }, { en: "play", bn: "খেলে" }, { en: "cricket", bn: "ক্রিকেট" }],
        tip: "Boys মানে ছেলেরা, তাই একের বেশি।",
      },
      {
        id: "n4",
        prompt: "Players: Singular না Plural?",
        sentence: "Players kick balls.",
        bangla: "খেলোয়াড়রা বল মারে।",
        options: ["Plural", "Singular"],
        answer: "Plural",
        map: [{ en: "Players", bn: "খেলোয়াড়রা" }, { en: "kick", bn: "মারে" }, { en: "balls", bn: "বল" }],
        tip: "Players মানে খেলোয়াড়রা, তাই একের বেশি।",
      },
    ],
  },
  {
    id: "person",
    label: "Quest 5",
    title: "Who Is Speaking?",
    emoji: "💬",
    tone: "from-indigo-600 to-violet-700",
    definitionBn: "কে কথা বলছে বা কার সঙ্গে কথা হচ্ছে, সেটি Person বোঝায়।",
    definitionEn: "Person shows who is speaking or being spoken to.",
    rule: "I/We = First · You = Second · They = Third",
    exampleBn: "আমি বলি · তুমি শোনো · তারা দেখে",
    example: [
      { en: "I / We", bn: "আমি / আমরা", role: "subject" },
      { en: "You", bn: "তুমি / তোমরা", role: "subject" },
      { en: "They", bn: "তারা", role: "subject" },
    ],
    rescue: [
      "নিজের কথা বললে First Person।",
      "সামনের মানুষকে বললে Second Person।",
      "অন্যদের কথা বললে Third Person।",
      "I/We = First · You = Second · They = Third।",
    ],
    questions: [
      {
        id: "p1",
        prompt: "I কোন Person?",
        sentence: "I draw maps.",
        bangla: "আমি মানচিত্র আঁকি।",
        options: ["Second Person", "First Person", "Third Person"],
        answer: "First Person",
        map: [{ en: "I", bn: "আমি" }, { en: "draw", bn: "আঁকি" }, { en: "maps", bn: "মানচিত্র" }],
        tip: "নিজের কথা I দিয়ে বলি। তাই First Person।",
      },
      {
        id: "p2",
        prompt: "We কোন Person?",
        sentence: "We carry boxes.",
        bangla: "আমরা বাক্স বহন করি।",
        options: ["Third Person", "Second Person", "First Person"],
        answer: "First Person",
        map: [{ en: "We", bn: "আমরা" }, { en: "carry", bn: "বহন করি" }, { en: "boxes", bn: "বাক্স" }],
        tip: "We মানে আমরা। নিজের দলের কথা, তাই First Person।",
      },
      {
        id: "p3",
        prompt: "You কোন Person?",
        sentence: "You drink water.",
        bangla: "তুমি পানি পান করো।",
        options: ["First Person", "Third Person", "Second Person"],
        answer: "Second Person",
        map: [{ en: "You", bn: "তুমি" }, { en: "drink", bn: "পান করো" }, { en: "water", bn: "পানি" }],
        tip: "যার সঙ্গে কথা বলি, তাকে You বলি। তাই Second Person।",
      },
      {
        id: "p4",
        prompt: "They কোন Person?",
        sentence: "They read maps.",
        bangla: "তারা মানচিত্র পড়ে।",
        options: ["Second Person", "Third Person", "First Person"],
        answer: "Third Person",
        map: [{ en: "They", bn: "তারা" }, { en: "read", bn: "পড়ে" }, { en: "maps", bn: "মানচিত্র" }],
        tip: "অন্যদের কথা They দিয়ে বলি। তাই Third Person।",
      },
    ],
  },
  {
    id: "order",
    label: "Quest 6",
    title: "Order Detective",
    emoji: "🧩",
    tone: "from-cyan-500 to-sky-700",
    definitionBn: "বাংলায় সাধারণত S-O-V। ইংরেজিতে S-V-O। অর্থ একই, শুধু জায়গা বদলায়।",
    definitionEn: "English order: Subject + Verb + Object.",
    rule: "English = S + V + O",
    exampleBn: "তারা মাছ ধরে।",
    example: [
      { en: "They", bn: "তারা", role: "subject" },
      { en: "catch", bn: "ধরে", role: "verb" },
      { en: "fish", bn: "মাছ", role: "object" },
    ],
    rescue: [
      "ইংরেজিতে Subject আগে বসাও।",
      "তারপর Verb বসাও।",
      "Object সবশেষে বসাও।",
      "They + catch + fish = They catch fish.",
    ],
    questions: [
      {
        id: "w1",
        prompt: "কোনটি সঠিক ইংরেজি বাক্য?",
        bangla: "আমি ভাত খাই।",
        options: ["I rice eat.", "I eat rice.", "Rice I eat."],
        answer: "I eat rice.",
        map: [{ en: "I", bn: "আমি" }, { en: "eat", bn: "খাই" }, { en: "rice", bn: "ভাত" }],
        tip: "Subject + Verb + Object: I eat rice.",
      },
      {
        id: "w2",
        prompt: "সঠিক SVO বাক্য বেছে নাও।",
        bangla: "ছাত্ররা প্রশ্ন করে।",
        options: ["Questions students ask.", "Students ask questions.", "Students questions ask."],
        answer: "Students ask questions.",
        map: [{ en: "Students", bn: "ছাত্ররা" }, { en: "ask", bn: "করে" }, { en: "questions", bn: "প্রশ্ন" }],
        tip: "Students আগে, ask তারপর, questions শেষে।",
      },
      {
        id: "w3",
        prompt: "শব্দগুলো ঠিকভাবে সাজাও।",
        bangla: "আমরা বল ছুঁড়ি।",
        options: ["Balls throw we.", "We balls throw.", "We throw balls."],
        answer: "We throw balls.",
        map: [{ en: "We", bn: "আমরা" }, { en: "throw", bn: "ছুঁড়ি" }, { en: "balls", bn: "বল" }],
        tip: "We + throw + balls।",
      },
      {
        id: "w4",
        prompt: "শেষ চেক: সঠিক বাক্য কোনটি?",
        bangla: "কৃষকরা ফসল কাটে।",
        options: ["Farmers cut crops.", "Crops farmers cut.", "Farmers crops cut."],
        answer: "Farmers cut crops.",
        map: [{ en: "Farmers", bn: "কৃষকরা" }, { en: "cut", bn: "কাটে" }, { en: "crops", bn: "ফসল" }],
        tip: "Farmers + cut + crops।",
      },
    ],
  },
  {
    id: "boss",
    label: "Final Boss",
    title: "Bangla to English",
    emoji: "🏆",
    tone: "from-amber-500 to-yellow-600",
    definitionBn: "এবার বাংলা দেখে নিজেই সঠিক ইংরেজি বাক্য বেছে নাও।",
    definitionEn: "Build the English sentence in SVO order.",
    rule: "অর্থ একই · Order বদলাবে",
    exampleBn: "আমরা চা বানাই।",
    example: [
      { en: "We", bn: "আমরা", role: "subject" },
      { en: "make", bn: "বানাই", role: "verb" },
      { en: "tea", bn: "চা", role: "object" },
    ],
    rescue: [
      "বাংলা শব্দগুলোর English pair দেখো।",
      "Subject-কে আগে রাখো।",
      "Verb-কে Subject-এর পরে রাখো।",
      "শেষে Object বসিয়ে সম্পূর্ণ SVO বাক্য বানাও।",
    ],
    questions: [
      {
        id: "b1",
        prompt: "সঠিক অনুবাদ কোনটি?",
        bangla: "আমরা মাছ খাই।",
        options: ["We fish eat.", "We eat fish.", "Fish eat we."],
        answer: "We eat fish.",
        map: [{ en: "We", bn: "আমরা" }, { en: "eat", bn: "খাই" }, { en: "fish", bn: "মাছ" }],
        tip: "We + eat + fish।",
      },
      {
        id: "b2",
        prompt: "সঠিক অনুবাদ বেছে নাও।",
        bangla: "তারা বই কেনে।",
        options: ["They buy books.", "Books buy they.", "They books buy."],
        answer: "They buy books.",
        map: [{ en: "They", bn: "তারা" }, { en: "buy", bn: "কেনে" }, { en: "books", bn: "বই" }],
        tip: "They + buy + books।",
      },
      {
        id: "b3",
        prompt: "ইংরেজি বাক্যটি তৈরি করো।",
        bangla: "তুমি মেঝে পরিষ্কার করো।",
        options: ["Floors you clean.", "You floors clean.", "You clean floors."],
        answer: "You clean floors.",
        map: [{ en: "You", bn: "তুমি" }, { en: "clean", bn: "পরিষ্কার করো" }, { en: "floors", bn: "মেঝে" }],
        tip: "You + clean + floors।",
      },
      {
        id: "b4",
        prompt: "Final hit: সঠিক অনুবাদ কোনটি?",
        bangla: "শিশুরা খেলনা ভালোবাসে।",
        options: ["Children love toys.", "Toys children love.", "Children toys love."],
        answer: "Children love toys.",
        map: [{ en: "Children", bn: "শিশুরা" }, { en: "love", bn: "ভালোবাসে" }, { en: "toys", bn: "খেলনা" }],
        tip: "Children + love + toys।",
      },
    ],
  },
];

const TOTAL_QUESTIONS = QUESTS.reduce((sum, quest) => sum + quest.questions.length, 0);
const LAB_PROGRESS_KEY = "gamlish:mission-one-lab:v2";

type LabScreen = "opening" | "teach" | "question" | "break" | "victory";

type SavedLabProgress = {
  screen: LabScreen;
  questIndex: number;
  questionIndex: number;
  xp: number;
  correctCount: number;
};

function WordMap({ words, showRoles = false }: { words: MappedWord[]; showRoles?: boolean }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {words.map((word, index) => (
        <div key={`${word.en}-${index}`} className="text-center">
          <div
            className={cn(
              "min-w-20 rounded-xl border bg-white px-3 py-2 shadow-sm",
              word.role && ROLE_STYLES[word.role],
            )}
          >
            <p className="font-sans text-base font-black">{word.en}</p>
            <p className="font-bengali text-xs font-bold text-slate-800">{word.bn}</p>
          </div>
          {showRoles && word.role ? (
            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
              {ROLE_LABELS[word.role]}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1" aria-label={`Progress ${current} of ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-2 flex-1 rounded-full transition-colors",
            index < current ? "bg-sky-500" : "bg-slate-200",
          )}
        />
      ))}
    </div>
  );
}

export function MissionOneLab() {
  const [screen, setScreen] = useState<LabScreen>("opening");
  const [questIndex, setQuestIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [xp, setXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [ready, setReady] = useState(false);

  const quest = QUESTS[questIndex]!;
  const question = quest.questions[questionIndex]!;
  const isCorrect = selected === question.answer;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAB_PROGRESS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedLabProgress>;
        const savedQuest = Math.min(
          QUESTS.length - 1,
          Math.max(0, Number(saved.questIndex) || 0),
        );
        const maxQuestion = QUESTS[savedQuest]!.questions.length - 1;
        setQuestIndex(savedQuest);
        setQuestionIndex(
          Math.min(maxQuestion, Math.max(0, Number(saved.questionIndex) || 0)),
        );
        setXp(Math.max(0, Number(saved.xp) || 0));
        setCorrectCount(Math.max(0, Number(saved.correctCount) || 0));
        if (
          saved.screen === "teach" ||
          saved.screen === "question" ||
          saved.screen === "break"
        ) {
          setScreen(saved.screen);
        }
      }
    } catch {
      localStorage.removeItem(LAB_PROGRESS_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready || checked || screen === "opening" || screen === "victory") return;
    const saved: SavedLabProgress = {
      screen,
      questIndex,
      questionIndex,
      xp,
      correctCount,
    };
    localStorage.setItem(LAB_PROGRESS_KEY, JSON.stringify(saved));
  }, [checked, correctCount, questionIndex, questIndex, ready, screen, xp]);

  const begin = () => {
    void primeEvalSfx();
    void playUiClickSfx();
    setScreen("teach");
  };

  const check = () => {
    if (!selected) return;
    setChecked(true);
    if (selected === question.answer) {
      setXp((value) => value + (wrongAttempts === 0 ? 2 : 1));
      setCorrectCount((value) => value + 1);
      void playCorrectEvalSfx();
    } else {
      setWrongAttempts((value) => Math.min(4, value + 1));
      void playUiClickSfx();
    }
  };

  const retry = () => {
    setSelected(null);
    setChecked(false);
  };

  const advance = () => {
    void playUiClickSfx();
    setSelected(null);
    setChecked(false);
    setWrongAttempts(0);

    if (questionIndex < quest.questions.length - 1) {
      setQuestionIndex((value) => value + 1);
      return;
    }
    if (questIndex < QUESTS.length - 1) {
      setScreen("break");
      return;
    }
    localStorage.removeItem(LAB_PROGRESS_KEY);
    setScreen("victory");
    void playCelebrateSfx();
  };

  const startNextQuest = () => {
    void playUiClickSfx();
    setQuestIndex((value) => value + 1);
    setQuestionIndex(0);
    setScreen("teach");
  };

  const reset = () => {
    setQuestIndex(0);
    setQuestionIndex(0);
    setSelected(null);
    setChecked(false);
    setWrongAttempts(0);
    setXp(0);
    setCorrectCount(0);
    localStorage.removeItem(LAB_PROGRESS_KEY);
    setScreen("opening");
  };

  if (!ready) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-sky-50 text-sm font-bold text-sky-900">
        Mission Lab খুলছে...
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_45%,#ffffff_100%)] text-slate-900">
      <MissionZeroConfetti active={screen === "victory"} />
      <div className="pointer-events-none absolute -left-24 top-28 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/player"
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-white/70 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit lab
            </Link>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-sky-700 shadow-sm ring-1 ring-sky-200">
                Mission 01 Lab
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">
                <Zap className="h-3.5 w-3.5 fill-current" /> {xp} XP
              </span>
            </div>
          </div>
          {screen === "question" ? (
            <div className="mt-4">
              <StepProgress current={questIndex + 1} total={QUESTS.length} />
              <div className="mt-2 flex justify-between text-xs font-bold text-slate-700">
                <span>{quest.label} · {quest.title}</span>
                <span>এই অংশ: {questionIndex + 1}/{quest.questions.length}</span>
              </div>
            </div>
          ) : null}
        </header>

        <AnimatePresence mode="wait">
          {screen === "opening" ? (
            <motion.section
              key="opening"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="my-auto"
            >
              <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-xl shadow-sky-900/10 backdrop-blur">
                <div className="bg-gradient-to-br from-sky-500 to-blue-700 px-6 py-7 text-white sm:px-8">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-100">Free Mission · Text only</p>
                  <h1 className="mt-2 text-3xl font-black sm:text-4xl">বাক্যের Secret Map</h1>
                  <p className="mt-2 max-w-md font-bengali text-base leading-relaxed text-sky-50">
                    বাংলা আর ইংরেজির অর্থ একই। শুধু শব্দগুলোর জায়গা বদলায়।
                  </p>
                </div>
                <div className="space-y-6 px-5 py-6 sm:px-8">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                    <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
                      <p className="font-bengali text-sm font-bold">বাংলা</p>
                      <p className="mt-1 text-lg font-black text-amber-800">S + O + V</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                    <div className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-200">
                      <p className="font-bengali text-sm font-bold">English</p>
                      <p className="mt-1 text-lg font-black text-sky-700">S + V + O</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="font-bengali text-sm font-semibold text-slate-600">আমি ভাত খাই।</p>
                    <p className="my-2 text-xs font-black uppercase tracking-wider text-slate-400">same meaning</p>
                    <WordMap
                      showRoles
                      words={[
                        { en: "I", bn: "আমি", role: "subject" },
                        { en: "eat", bn: "খাই", role: "verb" },
                        { en: "rice", bn: "ভাত", role: "object" },
                      ]}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-violet-100 px-4 py-3 font-bengali text-sm font-black text-violet-950 ring-1 ring-violet-300">
                    <Pause className="h-4 w-4" />
                    8টি ছোট অংশ · প্রতিটি অংশের পর বিরতি নেওয়া যাবে
                  </div>
                  <Button onClick={begin} size="lg" className="h-14 w-full rounded-2xl bg-sky-600 text-base font-black hover:bg-sky-700">
                    খেলা শুরু করি <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.section>
          ) : null}

          {screen === "teach" ? (
            <motion.section
              key={`teach-${quest.id}`}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              className="my-auto"
            >
              <div className="overflow-hidden rounded-[2rem] border border-white bg-white/90 shadow-xl shadow-slate-900/10">
                <div className={cn("bg-gradient-to-br px-6 py-6 text-white", quest.tone)}>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">{quest.label}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-4xl" aria-hidden>{quest.emoji}</span>
                    <h2 className="text-2xl font-black sm:text-3xl">{quest.title}</h2>
                  </div>
                </div>
                <div className="space-y-5 px-5 py-6 sm:px-8">
                  <div>
                    <p className="font-bengali text-lg font-bold leading-relaxed">{quest.definitionBn}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{quest.definitionEn}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
                    <span className="inline-flex rounded-full bg-white px-4 py-2 font-bengali text-sm font-bold leading-relaxed text-slate-900 shadow-sm ring-1 ring-slate-300">
                      মনে রাখো: {quest.rule}
                    </span>
                    <p className="mb-4 mt-4 font-bengali text-base font-bold leading-relaxed text-slate-900">
                      {quest.exampleBn}
                    </p>
                    <WordMap words={quest.example} showRoles />
                  </div>
                  <Button
                    onClick={() => {
                      void primeEvalSfx();
                      void playUiClickSfx();
                      setScreen("question");
                    }}
                    size="lg"
                    className="h-14 w-full rounded-2xl text-base font-black"
                  >
                    বুঝেছি · এবার খেলি <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.section>
          ) : null}

          {screen === "question" ? (
            <motion.section
              key={question.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              className="flex flex-1 flex-col"
            >
              <div className="my-auto rounded-[2rem] border border-white bg-white/90 p-5 shadow-xl shadow-slate-900/10 sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-xl">{quest.emoji}</span>
                  <div>
                    <p className="font-bengali text-lg font-black leading-snug sm:text-xl">{question.prompt}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">একটি উত্তর বেছে নাও</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
                  {question.sentence ? (
                    <p className="font-sans text-xl font-black tracking-tight sm:text-2xl">{question.sentence}</p>
                  ) : null}
                  <p className={cn("font-bengali text-sm font-semibold text-slate-600", question.sentence && "mt-1.5")}>
                    {question.bangla}
                  </p>
                  <div className="mt-4">
                    <WordMap words={question.map} />
                  </div>
                </div>

                <div className="mt-5 grid gap-2.5">
                  {question.options.map((option, index) => {
                    const chosen = selected === option;
                    const correctOption = checked && option === question.answer;
                    const wrongOption = checked && chosen && !isCorrect;
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={checked}
                        onClick={() => {
                          void primeEvalSfx();
                          void playUiClickSfx();
                          setSelected(option);
                        }}
                        className={cn(
                          "flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-sans text-base font-bold transition-all",
                          !chosen && !correctOption && "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50",
                          chosen && !checked && "border-sky-500 bg-sky-50 text-sky-900",
                          correctOption && "border-emerald-500 bg-emerald-50 text-emerald-900",
                          wrongOption && "border-rose-500 bg-rose-50 text-rose-900",
                        )}
                      >
                        <span className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black",
                          chosen || correctOption ? "bg-current/10" : "bg-slate-100 text-slate-500",
                        )}>
                          {correctOption ? <Check className="h-4 w-4" /> : wrongOption ? <X className="h-4 w-4" /> : String.fromCharCode(65 + index)}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {checked ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "mt-4 rounded-2xl border p-4",
                        isCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50",
                      )}
                    >
                      <p className={cn("flex items-center gap-2 font-bengali text-base font-black", isCorrect ? "text-emerald-800" : "text-amber-900")}>
                        {isCorrect ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                        {isCorrect ? "দারুণ! ঠিক ধরেছো।" : `আরেকভাবে দেখি · Help ${Math.min(4, wrongAttempts)}/4`}
                      </p>
                      <p className="mt-1.5 font-bengali text-sm font-semibold leading-relaxed text-slate-700">
                        {isCorrect ? question.tip : quest.rescue[Math.max(0, Math.min(3, wrongAttempts - 1))]}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="mt-5">
                  {!checked ? (
                    <Button disabled={!selected} onClick={check} size="lg" className="h-13 w-full rounded-2xl text-base font-black">
                      উত্তর মিলাই
                    </Button>
                  ) : isCorrect ? (
                    <Button onClick={advance} size="lg" className="h-13 w-full rounded-2xl bg-emerald-600 text-base font-black hover:bg-emerald-700">
                      এগিয়ে যাই <ArrowRight className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button onClick={retry} size="lg" className="h-13 w-full rounded-2xl bg-amber-500 text-base font-black text-slate-950 hover:bg-amber-400">
                      <RotateCcw className="h-4 w-4" /> আবার চেষ্টা করি
                    </Button>
                  )}
                </div>
              </div>
            </motion.section>
          ) : null}

          {screen === "break" ? (
            <motion.section
              key={`break-${quest.id}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -18 }}
              className="my-auto"
            >
              <div className="overflow-hidden rounded-[2rem] border border-emerald-300 bg-white shadow-2xl shadow-emerald-900/15">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 px-6 py-7 text-center text-white">
                  <motion.span
                    initial={{ scale: 0.5, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-700 shadow-xl"
                  >
                    <Check className="h-9 w-9 stroke-[3]" />
                  </motion.span>
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-emerald-100">
                    Part {questIndex + 1} of {QUESTS.length} complete
                  </p>
                  <h2 className="mt-1 font-bengali text-2xl font-black">{quest.title} শেষ!</h2>
                </div>

                <div className="space-y-5 px-5 py-6 text-center sm:px-8">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-amber-100 p-4 text-amber-950 ring-1 ring-amber-300">
                      <p className="text-2xl font-black">{xp} XP</p>
                      <p className="font-bengali text-xs font-black">মোট অর্জন</p>
                    </div>
                    <div className="rounded-2xl bg-sky-100 p-4 text-sky-950 ring-1 ring-sky-300">
                      <p className="text-2xl font-black">{quest.questions.length}/{quest.questions.length}</p>
                      <p className="font-bengali text-xs font-black">এই অংশ শেষ</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-violet-100 p-4 text-left text-violet-950 ring-1 ring-violet-300">
                    <p className="flex items-center gap-2 font-bengali text-sm font-black">
                      <Pause className="h-4 w-4" /> এখন বিরতি নিতে পারো
                    </p>
                    <p className="mt-1 font-bengali text-xs font-bold leading-relaxed text-violet-800">
                      তোমার progress সেভ আছে। পরে এই লিংক খুললে এখান থেকেই শুরু হবে।
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-4 text-left text-white">
                    <p className="text-[10px] font-black uppercase tracking-wider text-sky-300">Next short part</p>
                    <p className="mt-1 text-lg font-black">
                      {QUESTS[questIndex + 1]!.emoji} {QUESTS[questIndex + 1]!.title}
                    </p>
                    <p className="mt-1 font-bengali text-xs font-bold text-white/75">
                      আগে ছোট explanation, তারপর মাত্র {QUESTS[questIndex + 1]!.questions.length}টি question।
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      onClick={startNextQuest}
                      size="lg"
                      className="h-14 rounded-2xl bg-sky-700 text-base font-black hover:bg-sky-800"
                    >
                      <Play className="h-4 w-4 fill-current" /> পরের অংশ শুরু
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-14 rounded-2xl border-2 font-bengali font-black">
                      <Link href="/player">
                        <Pause className="h-4 w-4" /> এখন বিরতি নিই
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.section>
          ) : null}

          {screen === "victory" ? (
            <motion.section
              key="victory"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="my-auto"
            >
              <div className="overflow-hidden rounded-[2rem] border border-amber-200 bg-white/95 text-center shadow-2xl shadow-amber-900/15">
                <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500 px-6 py-8">
                  <motion.div
                    initial={{ rotate: -15, scale: 0.5 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 14 }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-amber-500 shadow-xl"
                  >
                    <Trophy className="h-11 w-11 fill-current" />
                  </motion.div>
                  <h2 className="mt-4 font-bengali text-3xl font-black text-slate-950">Mission 01 জয়!</h2>
                  <p className="mt-1 font-bengali text-sm font-bold text-amber-950/75">তুমি এখন বাক্যের Secret Map জানো।</p>
                </div>
                <div className="space-y-5 px-5 py-6 sm:px-8">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-200">
                      <p className="text-2xl font-black text-sky-700">{correctCount}/{TOTAL_QUESTIONS}</p>
                      <p className="font-bengali text-xs font-bold text-slate-500">Skills cleared</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                      <p className="text-2xl font-black text-amber-700">{xp} XP</p>
                      <p className="font-bengali text-xs font-bold text-slate-500">Lab reward</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Subject Finder", "Verb Hunter", "Object Catcher", "SVO Builder"].map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-black text-violet-800">
                        <Sparkles className="h-3.5 w-3.5" /> {skill}
                      </span>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-slate-950 p-5 text-left text-white">
                    <p className="text-xs font-black uppercase tracking-wider text-sky-300">Next mission</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-black">Mission 02 · Meet the Words</p>
                        <p className="mt-1 font-bengali text-xs text-white/60">Noun, Pronoun এবং Adjective নিয়ে নতুন খেলা।</p>
                      </div>
                      <Crown className="h-8 w-8 shrink-0 text-amber-300" />
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button asChild size="lg" className="h-13 rounded-2xl font-black">
                      <Link href="/pricing?course=english-foundations">পুরো পথ আনলক করি</Link>
                    </Button>
                    <Button onClick={reset} variant="outline" size="lg" className="h-13 rounded-2xl font-black">
                      <RotateCcw className="h-4 w-4" /> আবার টেস্ট করি
                    </Button>
                  </div>
                </div>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <footer className="mt-5 text-center text-[11px] font-semibold text-slate-400">
          Gamlish · gamlish.com · Curriculum Lab
        </footer>
      </div>
    </main>
  );
}
