import type { GamlishScanningTestData } from "./types";

export const GAMLISH_L1_SCANNING_MOCK: GamlishScanningTestData = {
  title: "Level 1 · Scanning Mission",
  passageTitle: "The Evolution of Football: From Ancient Rituals to Global Phenomenon",
  briefing:
    "Mission: Locate the exact sentence in the passage that contains the information matching the statements below.",
  proTip:
    'IELTS Scanning questions always follow the sequence of the text. Look for the strong "Locator Keyword" (like a name or date) to find the right area, then check the paraphrased words to confirm you have the exact sentence!',
  paragraphs: [
    {
      id: "p1",
      sentences: [
        {
          id: "s1",
          text: "The historical trajectory of association football reveals a fascinating journey from fragmented ancient rituals to a universally standardized sport.",
        },
        {
          id: "s2",
          text: "Early variations of the game were played across diverse ancient civilizations, though these preliminary contests lacked unified boundaries or universally accepted codes of conduct.",
        },
      ],
    },
    {
      id: "p2",
      sentences: [
        {
          id: "s3",
          text: "During the medieval period in Europe, the activity often resembled chaotic, village-wide brawls rather than a structured athletic competition.",
        },
        {
          id: "s4",
          text: "The pivotal moment for the sport's formalization occurred in 1863, when various regional associations unified to establish a codified set of regulations.",
        },
      ],
    },
    {
      id: "p3",
      sentences: [
        {
          id: "s5",
          text: "With a universal framework in place, the sport's popularity exploded across industrial urban centers.",
        },
        {
          id: "s6",
          text: "Consequently, what began as a recreational pursuit rapidly transformed into a highly structured commercial enterprise, drawing massive crowds of paying spectators.",
        },
        {
          id: "s7",
          text: "This transition from amateur recreation to professional athletics necessitated the construction of dedicated, large-scale stadiums to accommodate the growing public enthusiasm.",
        },
      ],
    },
    {
      id: "p4",
      sentences: [
        {
          id: "s8",
          text: "As the sport transcended national borders at the turn of the 20th century, a central governing body became essential to facilitate global competition.",
        },
        {
          id: "s9",
          text: "The establishment of FIFA was primarily driven by the urgent need to oversee and regulate the surging number of international fixtures.",
        },
        {
          id: "s10",
          text: "This organization eventually inaugurated the global tournament system, cementing the sport's status as a premier international spectacle.",
        },
      ],
    },
    {
      id: "p5",
      sentences: [
        {
          id: "s11",
          text: "In contemporary times, the sport's adaptability ensures its enduring relevance across vastly different landscapes.",
        },
        {
          id: "s12",
          text: "From massive grandstands to the fast-paced, close-quarters technicality of futsal played on urban courts, the core objective of the game continues to captivate millions globally.",
        },
      ],
    },
  ],
  questions: [
    {
      id: "q1",
      label: "Q1",
      questionStatement:
        "The critical turning point for the game's standardization happened in 1863 as different local groups came together to create a single rulebook.",
      targetKeywords: ["standardization", "1863", "single", "rulebook"],
      strongLocator: "1863",
      correctSentenceId: "s4",
      locatorSentenceIds: ["s4", "s3"],
    },
    {
      id: "q2",
      label: "Q2",
      questionStatement:
        "As a result, the casual pastime quickly evolved into a profitable business that attracted enormous numbers of ticket-buying fans.",
      targetKeywords: ["casual", "pastime", "profitable", "business", "ticket-buying", "fans"],
      strongLocator: null,
      correctSentenceId: "s6",
      locatorSentenceIds: [],
    },
    {
      id: "q3",
      label: "Q3",
      questionStatement:
        "The creation of FIFA was mainly motivated by the pressing requirement to manage and control the increasing volume of cross-border matches.",
      targetKeywords: ["creation", "FIFA", "cross-border", "matches"],
      strongLocator: "FIFA",
      correctSentenceId: "s9",
      locatorSentenceIds: ["s9", "s8", "s10"],
    },
  ],
};
