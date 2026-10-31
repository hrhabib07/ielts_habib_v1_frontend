import type { ChatLessonStep } from "@/src/features/chat-lesson/types";
// Relative `.ts` import so the Node audio/export scripts can load this file directly.
import { COLUMNS, options, PRAISE, table } from "./helpers.ts";

const SINGULAR = { en: "Singular Number", bn: "একবচন" };
const PLURAL = { en: "Plural Number", bn: "বহুবচন" };
const WRONG = { en: "Wrong", bn: "ভুল" };
const CORRECT = { en: "Correct", bn: "সঠিক" };
const NEVER_SAY = { en: "Never say", bn: "কখনো বলবেন না" };
const WORD = { en: "Word", bn: "শব্দ" };

export const NUMBER_STEP: ChatLessonStep = {
  id: "level-1-step-4-number",
  missionLabel: "Level 1",
  stepLabel: "Lesson 3",
  title: { en: "Number", bn: "নাম্বার" },
  guideName: "Gamlish",
  chunks: [
    {
      id: "what-is-number",
      title: { en: "What is Number?", bn: "Number কী?" },
      messages: [
        {
          en: "{name}, we already know that the **Subject** tells us who or what a sentence is about.",
          bn: "{name}, আমরা জানি, Subject আমাদের জানায় বাক্যে কার সম্পর্কে বা কী সম্পর্কে বলা হচ্ছে।",
        },
        {
          en: "Now, let's learn **how many** people or things the Subject refers to.",
          bn: "এখন শিখব, Subject কতজন ব্যক্তি বা কয়টি বস্তুকে বোঝায়।",
        },
        {
          variant: "example",
          en: "The boy plays football.",
          bn: "ছেলেটি ফুটবল খেলে।",
          glosses: [
            { text: "The boy", bn: "ছেলেটি" },
            { text: "plays", bn: "খেলে" },
            { text: "football", bn: "ফুটবল" },
          ],
        },
        {
          en: "Subject: **The boy**\nNumber: **One** boy",
          bn: "Subject: The boy (ছেলেটি)\nNumber: একজন ছেলে",
        },
        {
          variant: "example",
          en: "The boys play football.",
          bn: "ছেলেরা ফুটবল খেলে।",
          glosses: [
            { text: "The boys", bn: "ছেলেরা" },
            { text: "play", bn: "খেলে" },
            { text: "football", bn: "ফুটবল" },
          ],
        },
        {
          en: "Subject: **The boys**\nNumber: **More than one** boy",
          bn: "Subject: The boys (ছেলেরা)\nNumber: একাধিক ছেলে",
        },
        {
          en: "In the first example, the Subject refers to one person. In the second, it refers to more than one person. In English grammar, this difference is called **Number**.",
          bn: "প্রথম উদাহরণে Subject একজন ব্যক্তিকে বোঝায়। দ্বিতীয় উদাহরণে Subject একাধিক ব্যক্তিকে বোঝায়। ইংরেজি গ্রামারে এই পার্থক্যকে Number বলা হয়।",
        },
        {
          variant: "remember",
          en: "**Number** tells us whether a Subject refers to **one** or **more than one** person or thing.",
          bn: "Number আমাদের জানায়, Subject একজন ব্যক্তি বা একটি বস্তুকে বোঝায়, নাকি একাধিক ব্যক্তি বা বস্তুকে বোঝায়।",
        },
      ],
      questions: [
        {
          id: "q-number-girl",
          prompt: {
            en: "In “The girl reads a book,” how many people does the Subject refer to?",
            bn: "“The girl reads a book.” বাক্যটিতে Subject কতজন ব্যক্তিকে বোঝায়?",
          },
          options: options(
            ["One person", "একজন ব্যক্তি"],
            ["More than one person", "একাধিক ব্যক্তি"],
            ["No person", "কোনো ব্যক্তি নয়"],
          ),
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: {
            en: "Look at “The girl”. Is it one girl or many?",
            bn: "“The girl” দেখুন। একজন মেয়ে, নাকি অনেকজন?",
          },
          explanation: {
            en: "“The girl” refers to one person.",
            bn: "“The girl” একজন ব্যক্তিকে বোঝায়।",
          },
        },
        {
          id: "q-number-students",
          prompt: {
            en: "In “The students learn English,” how many students does the Subject refer to?",
            bn: "“The students learn English.” বাক্যটিতে Subject কতজন শিক্ষার্থীকে বোঝায়?",
          },
          options: options(
            ["One student", "একজন শিক্ষার্থী"],
            ["Three teachers", "তিনজন শিক্ষক"],
            ["More than one student", "একাধিক শিক্ষার্থী"],
          ),
          correctOptionId: "c",
          praise: { en: "Correct, {name}!", bn: "সঠিক, {name}!" },
          hint: {
            en: "Look at the end of “students”. What does the -s tell you?",
            bn: "“students” শব্দের শেষটা খেয়াল করুন। -s কী বোঝায়?",
          },
          explanation: {
            en: "“The students” refers to more than one student.",
            bn: "“The students” একাধিক শিক্ষার্থীকে বোঝায়।",
          },
        },
      ],
    },
    {
      id: "singular-plural",
      title: { en: "Singular and Plural", bn: "Singular এবং Plural" },
      messages: [
        {
          en: "Number has two main forms: **Singular** and **Plural**.",
          bn: "Number প্রধানত দুই ধরনের: Singular এবং Plural।",
        },
        {
          en: "**Singular**: when a Subject refers to **one** person or thing.",
          bn: "Singular Number: Subject একজন ব্যক্তি বা একটি বস্তুকে বোঝালে তাকে Singular Number বলে।",
          table: table(
            [COLUMNS.english, COLUMNS.bangla],
            [
              ["The boy", "ছেলেটি"],
              ["A book", "একটি বই"],
              ["My friend", "আমার বন্ধু"],
            ],
          ),
        },
        {
          en: "**Plural**: when a Subject refers to **more than one** person or thing.",
          bn: "Plural Number: Subject একাধিক ব্যক্তি বা বস্তুকে বোঝালে তাকে Plural Number বলে।",
          table: table(
            [COLUMNS.english, COLUMNS.bangla],
            [
              ["The boys", "ছেলেরা"],
              ["Two books", "দুটি বই"],
              ["My friends", "আমার বন্ধুরা"],
            ],
          ),
        },
        {
          variant: "remember",
          en: "**Singular** = One\n**Plural** = More than one",
          bn: "Singular = একজন বা একটি\nPlural = একাধিক",
        },
      ],
      questions: [
        {
          id: "q-number-which-singular",
          prompt: { en: "Which Subject is Singular?", bn: "কোন Subject-টি Singular?" },
          options: options(["My friends", "আমার বন্ধুরা"], ["The boys", "ছেলেরা"], ["A student", "একজন শিক্ষার্থী"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: {
            en: "Singular means one. Which one talks about just one person?",
            bn: "Singular মানে একজন। কোনটি শুধু একজনকে বোঝায়?",
          },
          explanation: {
            en: "“A student” refers to one person.",
            bn: "“A student” একজন শিক্ষার্থীকে বোঝায়।",
          },
        },
        {
          id: "q-number-which-plural",
          prompt: { en: "Which Subject is Plural?", bn: "কোন Subject-টি Plural?" },
          options: options(["The teacher", "শিক্ষকটি"], ["My brothers", "আমার ভাইয়েরা"], ["A cat", "একটি বিড়াল"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: {
            en: "Plural means more than one. Look for the -s at the end.",
            bn: "Plural মানে একাধিক। কোনটার শেষে -s আছে, খুঁজুন।",
          },
          explanation: {
            en: "“My brothers” refers to more than one person.",
            bn: "“My brothers” একাধিক ব্যক্তিকে বোঝায়।",
          },
        },
        {
          id: "q-number-two-dogs",
          prompt: {
            en: "What is the Number of the Subject in “Two dogs play in the garden”?",
            bn: "“Two dogs play in the garden.” বাক্যটির Subject-এর Number কী?",
          },
          options: options([SINGULAR.en, SINGULAR.bn], [PLURAL.en, PLURAL.bn]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: {
            en: "“Two” dogs. Is two one, or more than one?",
            bn: "“Two” মানে দুটি। দুটি কি একটি, নাকি একাধিক?",
          },
          explanation: {
            en: "“Two dogs” refers to more than one dog.",
            bn: "“Two dogs” একাধিক কুকুরকে বোঝায়।",
          },
        },
      ],
    },
    {
      id: "one-to-many",
      title: { en: "From One to More Than One", bn: "একটি থেকে একাধিক" },
      messages: [
        {
          en: "We know that Singular means one and Plural means more than one. Now, let's see how a word **changes** when we talk about more than one.",
          bn: "আমরা জেনেছি, Singular মানে একটি এবং Plural মানে একাধিক। এবার দেখি, একাধিক বোঝানোর জন্য একটি শব্দ কীভাবে বদলে যায়।",
          table: table(
            [COLUMNS.singular, COLUMNS.plural],
            [
              [{ en: "book", bn: "book (একটি বই)" }, { en: "books", bn: "books (অনেক বই)" }],
              [{ en: "pen", bn: "pen (একটি কলম)" }, { en: "pens", bn: "pens (অনেক কলম)" }],
              [{ en: "ball", bn: "ball (একটি বল)" }, { en: "balls", bn: "balls (অনেক বল)" }],
              [{ en: "class", bn: "class (একটি শ্রেণি)" }, { en: "classes", bn: "classes (অনেক শ্রেণি)" }],
            ],
          ),
        },
        {
          en: "What do you notice, {name}? For many words, we add **-s** to show more than one. For some words, we add **-es**.",
          bn: "{name}, আপনি কী লক্ষ্য করলেন? অনেক শব্দের শেষে -s যোগ করে একাধিক বোঝানো হয়। কিছু শব্দের শেষে -es যোগ করা হয়।",
        },
        {
          variant: "example",
          en: "one book → two books",
          bn: "একটি বই → দুটি বই",
          glosses: [
            { text: "one book", bn: "একটি বই" },
            { text: "two books", bn: "দুটি বই" },
          ],
        },
        {
          variant: "example",
          en: "one class → two classes",
          bn: "একটি শ্রেণি → দুটি শ্রেণি",
          glosses: [
            { text: "one class", bn: "একটি শ্রেণি" },
            { text: "two classes", bn: "দুটি শ্রেণি" },
          ],
        },
      ],
      questions: [
        {
          id: "q-number-pens",
          prompt: {
            en: "Which word means more than one pen?",
            bn: "একাধিক কলম বোঝাতে কোন শব্দটি ব্যবহার করা হয়?",
          },
          options: options(["pens"], ["pen"], ["one pen"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: {
            en: "More than one usually ends with -s.",
            bn: "একাধিক বোঝাতে সাধারণত শব্দের শেষে -s থাকে।",
          },
          explanation: {
            en: "We add -s to “pen” to make “pens.”",
            bn: "“Pen”-এর শেষে -s যোগ করলে “pens” হয়।",
          },
        },
        {
          id: "q-number-balls",
          prompt: { en: "One ball becomes two what?", bn: "একটি Ball থেকে দুটি হলে কী হবে?" },
          options: options(["ball"], ["balls"], ["balles"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: {
            en: "“Ball” is a normal word. Just add one letter.",
            bn: "“Ball” একটা সাধারণ শব্দ। শুধু একটা অক্ষর যোগ করুন।",
          },
          explanation: { en: "“Ball” becomes “balls.”", bn: "“Ball” থেকে “balls” হয়।" },
        },
        {
          id: "q-number-classes",
          prompt: {
            en: "What is the correct form for more than one class?",
            bn: "একাধিক শ্রেণি বোঝাতে কোন শব্দটি সঠিক?",
          },
          options: options(["class"], ["classs"], ["classes"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.wellDone,
          hint: {
            en: "“Class” already ends with s. Just one more s looks strange!",
            bn: "“Class”-এর শেষে আগেই s আছে। আরেকটা s দিলে অদ্ভুত লাগে!",
          },
          explanation: {
            en: "We add -es to “class” to make “classes.”",
            bn: "“Class”-এর শেষে -es যোগ করলে “classes” হয়।",
          },
        },
      ],
    },
    {
      id: "s-or-es",
      title: { en: "When Do We Add -s or -es?", bn: "কখন -s বা -es যোগ করব?" },
      messages: [
        {
          en: "To show more than one, we often add **-s** or **-es** to a word.",
          bn: "একাধিক বোঝাতে অনেক সময় কোনো শব্দের শেষে -s বা -es যোগ করা হয়।",
        },
        {
          en: "**Rule 1:** Usually, add **-s**.",
          bn: "নিয়ম 1: সাধারণত -s যোগ করুন।",
          table: table(
            [COLUMNS.singular, COLUMNS.plural],
            [
              ["book", "books"],
              ["pen", "pens"],
              ["ball", "balls"],
            ],
          ),
        },
        {
          en: "**Rule 2:** For words ending in **-s, -ss, -sh, -ch, -x** or **-z**, we usually add **-es**.",
          bn: "নিয়ম 2: যেসব শব্দের শেষে -s, -ss, -sh, -ch, -x বা -z থাকে, সেগুলোর শেষে সাধারণত -es যোগ করা হয়।",
          table: table(
            [COLUMNS.singular, COLUMNS.plural],
            [
              ["class", "classes"],
              ["dish", "dishes"],
              ["watch", "watches"],
              ["box", "boxes"],
            ],
          ),
        },
        {
          variant: "remember",
          en: "Usually add **-s**. After **-s, -ss, -sh, -ch, -x** or **-z**, add **-es**.",
          bn: "সাধারণত -s যোগ করুন। শব্দের শেষে -s, -ss, -sh, -ch, -x বা -z থাকলে -es যোগ করুন।",
        },
      ],
      questions: [
        {
          id: "q-number-plural-pen",
          prompt: { en: "What is the plural form of “pen”?", bn: "“Pen”-এর Plural form কোনটি?" },
          options: options(["pens"], ["penes"], ["pen"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: {
            en: "Does “pen” end in -s, -sh, -ch, -x or -z? If not, use Rule 1.",
            bn: "“Pen”-এর শেষে কি -s, -sh, -ch, -x বা -z আছে? না থাকলে নিয়ম 1।",
          },
          explanation: {
            en: "We usually add -s to “pen.”",
            bn: "সাধারণত “pen”-এর শেষে -s যোগ করা হয়।",
          },
        },
        {
          id: "q-number-plural-dish",
          prompt: { en: "What is the plural form of “dish”?", bn: "“Dish”-এর Plural form কোনটি?" },
          options: options(["dishs"], ["dish"], ["dishes"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: { en: "Great, {name}!", bn: "দারুণ, {name}!" },
          hint: {
            en: "Look at the end of “dish”: -sh. Which rule fits?",
            bn: "“dish”-এর শেষটা দেখুন: -sh। কোন নিয়মটা খাটে?",
          },
          explanation: {
            en: "“Dish” ends in -sh, so we usually add -es.",
            bn: "“Dish”-এর শেষে -sh আছে, তাই সাধারণত -es যোগ করা হয়।",
          },
        },
        {
          id: "q-number-plural-box",
          prompt: { en: "Which word is correct for more than one box?", bn: "একাধিক box বোঝাতে কোন শব্দটি সঠিক?" },
          options: options(["boxs"], ["boxes"], ["box"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.wellDone,
          hint: { en: "“Box” ends in -x. Remember Rule 2!", bn: "“Box”-এর শেষে -x। নিয়ম 2 মনে করুন!" },
          explanation: {
            en: "“Box” ends in -x, so we add -es.",
            bn: "“Box”-এর শেষে -x আছে, তাই -es যোগ করা হয়।",
          },
        },
      ],
    },
    {
      id: "numbers-need-plurals",
      title: { en: "Numbers Need Plurals Too", bn: "সংখ্যার পরেও Plural লাগে" },
      messages: [
        {
          en: "In Bangla, we say **দুই ভাই** or **অনেক ছাত্র**. The word does not change after a number.",
          bn: "বাংলায় আমরা বলি দুই ভাই বা অনেক ছাত্র। সংখ্যার পরে শব্দটি বদলায় না।",
        },
        {
          en: "In English, the word **must change**. After **two, three, many** or any number bigger than one, use the **Plural** form.",
          bn: "কিন্তু ইংরেজিতে শব্দটি বদলাতেই হবে। two, three, many বা একের বেশি যেকোনো সংখ্যার পরে Plural form ব্যবহার করুন।",
          table: table(
            [WRONG, CORRECT, COLUMNS.bangla],
            [
              ["two brother", "two brothers", "দুই ভাই"],
              ["many student", "many students", "অনেক ছাত্র"],
              ["three book", "three books", "তিনটি বই"],
            ],
            [0],
          ),
        },
        {
          variant: "example",
          en: "I have two brothers.",
          bn: "আমার দুই ভাই আছে।",
          glosses: [
            { text: "I", bn: "আমি" },
            { text: "have", bn: "আছে" },
            { text: "two brothers", bn: "দুই ভাই" },
          ],
        },
        {
          en: "With **a**, **an** or **one**, the word stays **Singular**: a book, an apple, one pen.",
          bn: "a, an বা one থাকলে শব্দটি Singular থাকে: a book, an apple, one pen।",
        },
        {
          variant: "remember",
          en: "**One** = Singular: one book\n**Two or more** = Plural: two books",
          bn: "One থাকলে Singular: one book\nদুই বা তার বেশি হলে Plural: two books",
        },
      ],
      questions: [
        {
          id: "q-number-two-brothers",
          prompt: { en: "Which sentence is correct?", bn: "কোন বাক্যটি সঠিক?" },
          sourceBn: "আমার দুই ভাই আছে।",
          options: options(["I have two brothers."], ["I have two brother."], ["I have twos brother."]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: { en: "After “two”, the word must be Plural.", bn: "“two”-এর পরে শব্দটিকে Plural হতে হবে।" },
          explanation: {
            en: "“Two” means more than one, so “brother” becomes “brothers.”",
            bn: "“Two” মানে একাধিক, তাই “brother” হয়ে যায় “brothers”।",
          },
        },
        {
          id: "q-number-many-students",
          prompt: {
            en: "Fill in the blank: Many ___ learn English here.",
            bn: "শূন্যস্থান পূরণ করুন: Many ___ learn English here. (এখানে অনেক ছাত্র ইংরেজি শেখে।)",
          },
          options: options(["student"], ["studentes"], ["students"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.great,
          hint: { en: "“Many” means more than one.", bn: "“Many” মানে একাধিক।" },
          explanation: {
            en: "After “many”, use the Plural: “students.”",
            bn: "“many”-এর পরে Plural ব্যবহার করুন: “students”।",
          },
        },
        {
          id: "q-number-one-pen",
          prompt: { en: "Which one is correct?", bn: "কোনটি সঠিক?" },
          options: options(["one pens"], ["one pen"], ["a books"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.wellDone,
          hint: {
            en: "With “one” or “a”, keep the word Singular.",
            bn: "“one” বা “a” থাকলে শব্দটি Singular রাখুন।",
          },
          explanation: {
            en: "“One” means just one, so we say “one pen.”",
            bn: "“One” মানে একটি, তাই বলি “one pen”।",
          },
        },
      ],
    },
    {
      id: "special-plurals",
      title: { en: "Special Plurals", bn: "বিশেষ Plural" },
      messages: [
        {
          en: "Some common words do **not** add -s. Instead, their **spelling changes**.",
          bn: "কিছু পরিচিত শব্দে -s যোগ হয় না। বরং শব্দের বানানটাই বদলে যায়।",
        },
        {
          en: "Learn these words by heart, {name}. We use them **every day**.",
          bn: "{name}, এই শব্দগুলো মুখস্থ করে ফেলুন। এগুলো আমরা প্রতিদিন ব্যবহার করি।",
          table: table(
            [COLUMNS.singular, COLUMNS.plural, COLUMNS.bangla],
            [
              ["man", "men", "পুরুষ, লোক"],
              ["woman", "women", "মহিলা"],
              ["child", "children", "শিশু"],
              ["person", "people", "মানুষ"],
              ["tooth", "teeth", "দাঁত"],
              ["foot", "feet", "পা"],
              ["mouse", "mice", "ইঁদুর"],
            ],
          ),
        },
        {
          variant: "example",
          en: "The children play in the park.",
          bn: "শিশুরা পার্কে খেলে।",
          glosses: [
            { text: "The children", bn: "শিশুরা" },
            { text: "play", bn: "খেলে" },
            { text: "in the park", bn: "পার্কে" },
          ],
        },
        {
          en: "**Children**, **people**, **men** and **women** are already Plural. Never add -s to them. “Childrens” and “peoples” are wrong.",
          bn: "Children, people, men আর women আগে থেকেই Plural। এগুলোর শেষে আর -s যোগ করবেন না। “Childrens” বা “peoples” ভুল।",
        },
        {
          en: "Some words **do not change** at all: one fish, two fish. One sheep, ten sheep.",
          bn: "কিছু শব্দ একদমই বদলায় না: one fish, two fish। One sheep, ten sheep।",
        },
        {
          variant: "remember",
          en: "man → men, woman → women, child → children, person → people\n**fish** and **sheep** stay the same.",
          bn: "man → men, woman → women, child → children, person → people\nfish আর sheep একই থাকে।",
        },
      ],
      questions: [
        {
          id: "q-number-child",
          prompt: { en: "What is the Plural of “child”?", bn: "“Child”-এর Plural কোনটি?" },
          options: options(["children"], ["childs"], ["childrens"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: {
            en: "It is a special word. It does not add -s.",
            bn: "এটি একটি বিশেষ শব্দ। এতে -s যোগ হয় না।",
          },
          explanation: {
            en: "“Child” becomes “children.” Never say “childrens.”",
            bn: "“Child” থেকে হয় “children”। কখনো “childrens” বলবেন না।",
          },
        },
        {
          id: "q-number-people",
          prompt: { en: "Which word means more than one person?", bn: "একাধিক মানুষ বোঝাতে কোন শব্দটি?" },
          options: options(["peoples"], ["persones"], ["people"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.great,
          hint: {
            en: "Some words change their spelling, and then they never add -s.",
            bn: "কিছু শব্দের বানান বদলে যায়, তারপর আর -s যোগ হয় না।",
          },
          explanation: {
            en: "“Person” becomes “people.” “People” is already Plural, so “peoples” is wrong.",
            bn: "“Person” থেকে হয় “people”। “People” আগে থেকেই Plural, তাই “peoples” ভুল।",
          },
        },
        {
          id: "q-number-teeth",
          prompt: { en: "Which sentence is correct?", bn: "কোন বাক্যটি সঠিক?" },
          sourceBn: "আমি প্রতিদিন দাঁত ব্রাশ করি।",
          options: options(
            ["I brush my tooths every day."],
            ["I brush my teeth every day."],
            ["I brush my teeths every day."],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.wellDone,
          hint: {
            en: "“Tooth” is a special word, just like “foot” becomes “feet.”",
            bn: "“Tooth” একটি বিশেষ শব্দ, যেমন “foot” থেকে হয় “feet”।",
          },
          explanation: { en: "“Tooth” becomes “teeth.”", bn: "“Tooth” থেকে হয় “teeth”।" },
        },
        {
          id: "q-number-sheep",
          prompt: {
            en: "Fill in the blank: The farmer has ten ___.",
            bn: "শূন্যস্থান পূরণ করুন: The farmer has ten ___. (কৃষকের দশটি ভেড়া আছে।)",
          },
          options: options(["sheep"], ["sheeps"], ["sheepes"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.excellent,
          hint: { en: "Some words stay the same in the Plural.", bn: "কিছু শব্দ Plural-এ একই থাকে।" },
          explanation: { en: "“Sheep” stays “sheep” in the Plural.", bn: "Plural-এও “sheep” একই থাকে।" },
        },
      ],
    },
    {
      id: "words-ending-y",
      title: { en: "Words Ending in -y and More", bn: "-y দিয়ে শেষ হওয়া শব্দ ও আরও কিছু" },
      messages: [
        {
          en: "For words ending in **-y**, look at the letter **before** the y.",
          bn: "যেসব শব্দের শেষে -y আছে, সেখানে y-এর ঠিক আগের অক্ষরটি দেখুন।",
        },
        {
          en: "**a, e, i, o, u** are **vowels**. All other letters are **consonants**.",
          bn: "a, e, i, o, u হলো Vowel। বাকি সব অক্ষর Consonant।",
        },
        {
          en: "**Consonant + y**: change **y** to **i** and add **-es**.",
          bn: "Consonant + y: y-কে i করে -es যোগ করুন।",
          table: table(
            [COLUMNS.singular, COLUMNS.plural],
            [
              ["baby", "babies"],
              ["city", "cities"],
              ["story", "stories"],
              ["family", "families"],
            ],
          ),
        },
        {
          en: "**Vowel + y**: just add **-s**.",
          bn: "Vowel + y: শুধু -s যোগ করুন।",
          table: table(
            [COLUMNS.singular, COLUMNS.plural],
            [
              ["boy", "boys"],
              ["day", "days"],
              ["key", "keys"],
              ["toy", "toys"],
            ],
          ),
        },
        {
          en: "A few more words you will see often:",
          bn: "আরও কয়েকটি শব্দ, যেগুলো প্রায়ই দেখবেন:",
          table: table(
            [COLUMNS.singular, COLUMNS.plural],
            [
              ["knife", "knives"],
              ["leaf", "leaves"],
              ["wife", "wives"],
              ["potato", "potatoes"],
              ["tomato", "tomatoes"],
              ["photo", "photos"],
            ],
          ),
        },
        {
          variant: "remember",
          en: "baby → babies, but boy → boys\nknife → knives, potato → potatoes",
          bn: "baby → babies, কিন্তু boy → boys\nknife → knives, potato → potatoes",
        },
      ],
      questions: [
        {
          id: "q-number-baby",
          prompt: { en: "What is the Plural of “baby”?", bn: "“Baby”-এর Plural কোনটি?" },
          options: options(["babys"], ["babyes"], ["babies"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: { en: "Look before the -y: “b” is a consonant.", bn: "y-এর আগে দেখুন: “b” একটি Consonant।" },
          explanation: {
            en: "Consonant + y: change y to i and add -es. “Baby” becomes “babies.”",
            bn: "Consonant + y: y-কে i করে -es যোগ করুন। “Baby” থেকে হয় “babies”।",
          },
        },
        {
          id: "q-number-boy",
          prompt: { en: "What is the Plural of “boy”?", bn: "“Boy”-এর Plural কোনটি?" },
          options: options(["boys"], ["boies"], ["boyes"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.great,
          hint: { en: "Look before the -y: “o” is a vowel.", bn: "y-এর আগে দেখুন: “o” একটি Vowel।" },
          explanation: {
            en: "Vowel + y: just add -s. “Boy” becomes “boys.”",
            bn: "Vowel + y: শুধু -s যোগ করুন। “Boy” থেকে হয় “boys”।",
          },
        },
        {
          id: "q-number-cities",
          prompt: { en: "Which sentence is correct?", bn: "কোন বাক্যটি সঠিক?" },
          sourceBn: "ঢাকা ও চট্টগ্রাম বড় শহর।",
          options: options(
            ["Dhaka and Chattogram are big citys."],
            ["Dhaka and Chattogram are big cities."],
            ["Dhaka and Chattogram are big cityes."],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.wellDone,
          hint: {
            en: "“t” comes before the -y. Is it a vowel or a consonant?",
            bn: "y-এর আগে আছে “t”। এটি Vowel, নাকি Consonant?",
          },
          explanation: { en: "“City” becomes “cities.”", bn: "“City” থেকে হয় “cities”।" },
        },
      ],
    },
    {
      id: "no-plural",
      title: { en: "Words With No Plural", bn: "যেসব শব্দের Plural হয় না" },
      messages: [
        {
          en: "Some things **cannot be counted** one by one, like water or rice. These words have **no Plural**.",
          bn: "কিছু জিনিস এক, দুই করে গোনা যায় না, যেমন পানি বা চাল। এসব শব্দের কোনো Plural হয় না।",
        },
        {
          en: "Never add -s to these words:",
          bn: "এই শব্দগুলোর শেষে কখনো -s যোগ করবেন না:",
          table: table(
            [WORD, COLUMNS.bangla, NEVER_SAY],
            [
              ["water", "পানি", "waters"],
              ["rice", "ভাত, চাল", "rices"],
              ["money", "টাকা", "moneys"],
              ["homework", "বাড়ির কাজ", "homeworks"],
              ["information", "তথ্য", "informations"],
              ["advice", "পরামর্শ", "advices"],
              ["furniture", "আসবাবপত্র", "furnitures"],
            ],
            [2],
          ),
        },
        {
          variant: "example",
          en: "My teacher gives me good advice.",
          bn: "আমার শিক্ষক আমাকে ভালো পরামর্শ দেন।",
          glosses: [
            { text: "My teacher", bn: "আমার শিক্ষক" },
            { text: "gives", bn: "দেন" },
            { text: "me", bn: "আমাকে" },
            { text: "good advice", bn: "ভালো পরামর্শ" },
          ],
        },
        {
          variant: "remember",
          en: "Water, rice, money, homework, information and advice have **no Plural**.",
          bn: "Water, rice, money, homework, information আর advice-এর কোনো Plural হয় না।",
        },
      ],
      questions: [
        {
          id: "q-number-homework",
          prompt: { en: "Which sentence is correct?", bn: "কোন বাক্যটি সঠিক?" },
          sourceBn: "আজ আমার অনেক বাড়ির কাজ আছে।",
          options: options(
            ["I have a lot of homeworks today."],
            ["I have a lot of homeworkes today."],
            ["I have a lot of homework today."],
          ),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: { en: "Can you count homework one by one?", bn: "বাড়ির কাজ কি এক, দুই করে গোনা যায়?" },
          explanation: {
            en: "“Homework” has no Plural. Never say “homeworks.”",
            bn: "“Homework”-এর কোনো Plural নেই। কখনো “homeworks” বলবেন না।",
          },
        },
        {
          id: "q-number-information",
          prompt: { en: "Which one is correct?", bn: "কোনটি সঠিক?" },
          options: options(["useful information"], ["useful informations"], ["useful informationes"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.excellent,
          hint: {
            en: "Information is like water: we don't count it.",
            bn: "Information পানির মতো: এটি গোনা হয় না।",
          },
          explanation: { en: "“Information” has no Plural.", bn: "“Information”-এর কোনো Plural নেই।" },
        },
      ],
    },
    {
      id: "number-review",
      title: { en: "Number: Final Review", bn: "Number: চূড়ান্ত অনুশীলন" },
      messages: [
        {
          en: "**Number** tells us whether a Subject refers to one or more than one person or thing. **Singular** means one. **Plural** means more than one.",
          bn: "Number আমাদের জানায়, Subject একজন ব্যক্তি বা একটি বস্তুকে বোঝায়, নাকি একাধিক ব্যক্তি বা বস্তুকে বোঝায়। Singular মানে একজন বা একটি। Plural মানে একাধিক।",
        },
        {
          en: "We usually add **-s** to make many words Plural. We usually add **-es** to words ending in -s, -ss, -sh, -ch, -x or -z.",
          bn: "অনেক শব্দকে Plural করতে সাধারণত -s যোগ করা হয়। -s, -ss, -sh, -ch, -x বা -z দিয়ে শেষ হওয়া শব্দের শেষে সাধারণত -es যোগ করা হয়।",
          table: table(
            [COLUMNS.english, COLUMNS.bangla],
            [
              ["one book → two books", "একটি বই → দুটি বই"],
              ["one pen → three pens", "একটি কলম → তিনটি কলম"],
              ["one class → two classes", "একটি শ্রেণি → দুটি শ্রেণি"],
              ["one box → two boxes", "একটি বাক্স → দুটি বাক্স"],
            ],
          ),
        },
        {
          en: "After **two or more**, always use the Plural. Some words change their spelling (**child → children**). Consonant + y becomes **-ies** (**baby → babies**). Some words have **no Plural** (**water, homework**).",
          bn: "দুই বা তার বেশি হলে সবসময় Plural ব্যবহার করুন। কিছু শব্দের বানান বদলে যায় (child → children)। Consonant + y হলে -ies হয় (baby → babies)। কিছু শব্দের কোনো Plural নেই (water, homework)।",
        },
        { en: "Now, let's test your understanding, {name}!", bn: "{name}, চলুন, এবার নিজের বোঝাপড়া যাচাই করি!" },
      ],
      questions: [
        {
          id: "q-number-review-what",
          prompt: {
            en: "What does Number tell us about a Subject?",
            bn: "Number আমাদের Subject সম্পর্কে কী জানায়?",
          },
          options: options(
            ["The action in a sentence", "বাক্যের কাজ"],
            ["How many people or things the Subject refers to", "Subject কতজন ব্যক্তি বা কয়টি বস্তুকে বোঝায়"],
            ["The place where an action happens", "যেখানে কোনো কাজ ঘটে"],
          ),
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: {
            en: "Number is about counting: one, or more than one?",
            bn: "Number মানে গোনা: একটি, নাকি একাধিক?",
          },
          explanation: {
            en: "Number tells us whether a Subject refers to one or more than one person or thing.",
            bn: "Number আমাদের জানায়, Subject একজন বা একটি, নাকি একাধিক ব্যক্তি বা বস্তুকে বোঝায়।",
          },
        },
        {
          id: "q-number-review-singular",
          prompt: { en: "Which Subject is Singular?", bn: "কোন Subject-টি Singular?" },
          options: options(["A teacher", "একজন শিক্ষক"], ["The students", "শিক্ষার্থীরা"], ["Three books", "তিনটি বই"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.wellDone,
          hint: { en: "Find the one that means just one person.", bn: "শুধু একজনকে বোঝায় এমনটা খুঁজুন।" },
          explanation: {
            en: "“A teacher” refers to one person, so it is Singular.",
            bn: "“A teacher” একজন ব্যক্তিকে বোঝায়, তাই এটি Singular।",
          },
        },
        {
          id: "q-number-review-four-boys",
          prompt: {
            en: "In “The four boys play football,” what is the Number of the Subject?",
            bn: "“The four boys play football.” বাক্যটিতে Subject-এর Number কী?",
          },
          options: options([SINGULAR.en, SINGULAR.bn], [PLURAL.en, PLURAL.bn]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.correct,
          hint: { en: "“four boys”. How many is four?", bn: "“four boys”। চারজন মানে কয়জন?" },
          explanation: {
            en: "“The four boys” refers to more than one person, so it is Plural.",
            bn: "“The four boys” একাধিক ব্যক্তিকে বোঝায়, তাই এটি Plural।",
          },
        },
        {
          id: "q-number-review-pen",
          prompt: { en: "What is the correct Plural form of “pen”?", bn: "“Pen”-এর সঠিক Plural form কোনটি?" },
          options: options(["penes"], ["pen"], ["pens"]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.great,
          hint: { en: "Rule 1: usually just add -s.", bn: "নিয়ম 1: সাধারণত শুধু -s যোগ করুন।" },
          explanation: {
            en: "We usually add -s to “pen” to make “pens.”",
            bn: "সাধারণত “pen”-এর শেষে -s যোগ করে “pens” করা হয়।",
          },
        },
        {
          id: "q-number-review-watch",
          prompt: {
            en: "Which word is the correct Plural form of “watch”?",
            bn: "“Watch”-এর সঠিক Plural form কোনটি?",
          },
          options: options(["watches"], ["watchs"], ["watch"]),
          englishOptions: true,
          correctOptionId: "a",
          praise: PRAISE.correct,
          hint: { en: "“Watch” ends in -ch. Which rule is that?", bn: "“Watch”-এর শেষে -ch। এটা কোন নিয়ম?" },
          explanation: {
            en: "“Watch” ends in -ch, so we usually add -es.",
            bn: "“Watch”-এর শেষে -ch আছে, তাই সাধারণত -es যোগ করা হয়।",
          },
        },
        {
          id: "q-number-review-pair",
          prompt: { en: "Which pair is correct?", bn: "কোন জোড়াটি সঠিক?" },
          options: options(["one class → two class"], ["one dish → two dishes"], ["one box → two boxs"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.excellent,
          hint: {
            en: "Check the endings: -ss, -x and -sh all need the same thing.",
            bn: "শেষগুলো দেখুন: -ss, -x আর -sh সবগুলোতে একই জিনিস লাগে।",
          },
          explanation: {
            en: "“Dish” ends in -sh, so we add -es to make “dishes.”",
            bn: "“Dish”-এর শেষে -sh আছে, তাই -es যোগ করে “dishes” করা হয়।",
          },
        },
        {
          id: "q-number-review-two-books",
          prompt: { en: "Which sentence is correct?", bn: "কোন বাক্যটি সঠিক?" },
          sourceBn: "আমার দুটি বই আছে।",
          options: options(["I have two book."], ["I have a books."], ["I have two books."]),
          englishOptions: true,
          correctOptionId: "c",
          praise: PRAISE.correct,
          hint: { en: "Two is more than one.", bn: "দুই মানে একাধিক।" },
          explanation: {
            en: "After “two”, use the Plural: “two books.”",
            bn: "“two”-এর পরে Plural ব্যবহার করুন: “two books”।",
          },
        },
        {
          id: "q-number-review-children",
          prompt: { en: "Which sentence is correct?", bn: "কোন বাক্যটি সঠিক?" },
          sourceBn: "শিশুরা মাঠে খেলে।",
          options: options(
            ["The childrens play in the field."],
            ["The children play in the field."],
            ["The childs play in the field."],
          ),
          englishOptions: true,
          correctOptionId: "b",
          praise: PRAISE.great,
          hint: { en: "“Child” is a special word.", bn: "“Child” একটি বিশেষ শব্দ।" },
          explanation: {
            en: "“Children” is already Plural, so it never takes -s.",
            bn: "“Children” আগে থেকেই Plural, তাই এতে আর -s যোগ হয় না।",
          },
        },
        {
          id: "q-number-review-families",
          prompt: { en: "What is the Plural of “family”?", bn: "“Family”-এর Plural কোনটি?" },
          options: options(["familys"], ["families"], ["familyes"]),
          englishOptions: true,
          correctOptionId: "b",
          praise: { en: "Amazing, {name}!", bn: "অসাধারণ, {name}!" },
          hint: { en: "Look before the -y: “l” is a consonant.", bn: "y-এর আগে দেখুন: “l” একটি Consonant।" },
          explanation: {
            en: "Consonant + y: change y to i and add -es. “Family” becomes “families.”",
            bn: "Consonant + y: y-কে i করে -es যোগ করুন। “Family” থেকে হয় “families”।",
          },
        },
      ],
    },
  ],
};
