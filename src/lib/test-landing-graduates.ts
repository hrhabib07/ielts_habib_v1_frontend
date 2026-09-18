export interface TestLandingGraduate {
  readonly id: string;
  readonly fullName: string;
  readonly district: string;
  readonly imageUrl: string;
  readonly certificateId: string;
  readonly username: string;
  readonly storyBefore: string;
  readonly storyJourney: string;
  readonly storyTransformation: string;
  readonly storyMessage: string;
  readonly cardQuoteBn: string;
}

export const TEST_LANDING_MESSAGE_EXCERPT_CHARS = 78;

export const TEST_LANDING_GRADUATES: readonly TestLandingGraduate[] = [
  {
    id: "habib-ullah",
    fullName: "Habib Ullah",
    district: "Narayanganj",
    imageUrl:
      "https://res.cloudinary.com/daqvhd097/image/upload/v1789650813/2_zdhbjt.png",
    certificateId: "GML-CERT-FE-2026-Y57J3L",
    username: "habib_ahmed",
    storyBefore:
      "To be honest, before playing this amazing game (Gamlish), I could not understand tense and could make only simple sentences. I have bought a lot of books about spoken English and grammar, but I never studied them just because of laziness. But now I have finished this exciting course and learned many things with fun. Now I am very happy. May Allah bless the owner and the designer.",
    storyJourney:
      "Actually, I do not like to study, but I love to play games. And this is the magical thing about Gamlish. This game is designed so attractively. I just use it as a racing game and it was a game-changing thing for me. Thank you Gamlish.",
    storyTransformation:
      "As a Qawmi madrasha student, my English grammar was very poor. I could not understand or make tenses, reported speech, compound and complex sentences before, but now Alhamdulillah I can do this all, and the most important thing is I learned these all things very easily by playing this funny game.",
    storyMessage:
      "It will be the best decision to learn English grammar effectively and effortlessly. If you are a lazy learner, then Gamlish will help you a lot.",
    cardQuoteBn:
      "ইংরেজি গ্রামার সহজে শিখতে চাইলে Gamlish সেরা সিদ্ধান্ত।",
  },
  {
    id: "abdullah-salman",
    fullName: "Abdullah Salman",
    district: "Sylhet",
    imageUrl:
      "https://res.cloudinary.com/daqvhd097/image/upload/v1789650813/3_ictxzk.png",
    certificateId: "GML-CERT-FE-2026-944TVC",
    username: "abdullah_salman",
    storyBefore:
      "Before Gamlish, I always made grammar mistakes. I did not understand anything in English and I was scared to speak.",
    storyJourney:
      "On Gamlish, I did daily practice and played games. I learned grammar rules and new words step by step. I also tried to speak by myself.",
    storyTransformation:
      "Now I understand basic English. I can write correct sentences and speak a little without fear. My grammar is much better now.",
    storyMessage:
      "Do not be scared. Practice every day on Gamlish and your English will improve.",
    cardQuoteBn:
      "ভয় পাবেন না। প্রতিদিন Gamlish-এ প্র্যাকটিস করুন, ইংরেজি ভালো হবে।",
  },
  {
    id: "md-abbasur-rahman",
    fullName: "Md Abbasur Rahman",
    district: "Sylhet",
    imageUrl:
      "https://res.cloudinary.com/daqvhd097/image/upload/v1789650813/4_lmbjfv.png",
    certificateId: "GML-CERT-FE-2026-XJBQZE",
    username: "ar_bd1514",
    storyBefore:
      "Before using Gamlish, I had no idea about English verbs or how to make correct sentences.",
    storyJourney:
      "Gamlish is a very enjoyable English learning system. In this journey (Camp 1-4) I learned many words, the right form of verbs, and how to make a correct sentence.",
    storyTransformation: "Now I have basic knowledge of English.",
    storyMessage:
      "If you want to learn English from the basics, you need Gamlish.",
    cardQuoteBn:
      "বেসিক থেকে ইংরেজি শিখতে চাইলে আপনার Gamlish লাগবে।",
  },
];

export function excerptGraduateMessage(
  text: string,
  max = TEST_LANDING_MESSAGE_EXCERPT_CHARS,
): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const sliced = trimmed.slice(0, max);
  const cut = sliced.replace(/\s+\S*$/, "").trim();
  return `${cut || sliced}...`;
}
