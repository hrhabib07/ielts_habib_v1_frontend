import type { GamlishScanningContentAuthoringPreview } from "@/src/lib/api/adminReadingVersions";

export const L0_GAMLISH_BRIEFING =
  "Mission: Locate the exact sentence in the passage that contains the information matching the statements below.";

export const L0_GAMLISH_PRO_TIP =
  'IELTS Scanning questions always follow the sequence of the text. Look for the strong "Locator Keyword" (like a name or date) to find the right area, then check the paraphrased words to confirm you have the exact sentence!';

type QuestionDef = {
  id: string;
  label: string;
  order: number;
  questionStatement: string;
  targetKeywords: string[];
  strongLocator: string | null;
  correctSentenceId: string;
  locatorSentenceIds?: string[];
};

function buildParagraphs(paragraphs: string[][]): GamlishScanningContentAuthoringPreview["paragraphs"] {
  let sentenceCounter = 0;
  return paragraphs.map((sentences, pIdx) => ({
    id: `p${pIdx + 1}`,
    sentences: sentences.map((text) => {
      sentenceCounter += 1;
      return { id: `s${sentenceCounter}`, text };
    }),
  }));
}

function buildContent(
  passageTitle: string,
  paragraphSentences: string[][],
  questions: QuestionDef[],
): GamlishScanningContentAuthoringPreview {
  return {
    passageTitle,
    briefing: L0_GAMLISH_BRIEFING,
    proTip: L0_GAMLISH_PRO_TIP,
    paragraphs: buildParagraphs(paragraphSentences),
    questions,
  };
}

export const L0_PRACTICE_1_FOOTBALL = buildContent(
  "The Evolution of Football: From Ancient Rituals to Global Phenomenon",
  [
    [
      "The historical trajectory of association football reveals a fascinating journey from fragmented ancient rituals to a universally standardized sport.",
      "Early variations of the game were played across diverse ancient civilizations, though these preliminary contests lacked unified boundaries or universally accepted codes of conduct.",
    ],
    [
      "During the medieval period in Europe, the activity often resembled chaotic, village-wide brawls rather than a structured athletic competition.",
      "These unrestrained events were entirely devoid of tactical organization and frequently resulted in severe injuries, prompting several monarchs to attempt to ban the activity altogether to maintain public order.",
    ],
    [
      "The pivotal moment for the sport's formalization occurred in 1863, when various regional associations unified to establish a codified set of regulations.",
      "By agreeing to outlaw handling the ball and establishing standard pitch dimensions, these pioneers laid the groundwork for the modern, technical gameplay recognized around the world today.",
    ],
    [
      "With a universal framework in place, the sport's popularity exploded across industrial urban centers.",
      "Consequently, what began as a recreational pursuit rapidly transformed into a highly structured commercial enterprise, drawing massive crowds of paying spectators.",
      "This transition from amateur recreation to professional athletics necessitated the construction of dedicated, large-scale stadiums to accommodate the growing public enthusiasm.",
    ],
    [
      "As the sport transcended national borders at the turn of the 20th century, a central governing body became essential to facilitate global competition.",
      "The establishment of FIFA was primarily driven by the urgent need to oversee and regulate the surging number of international fixtures.",
      "This organization eventually inaugurated the global tournament system, cementing the sport's status as a premier international spectacle.",
    ],
    [
      "In contemporary times, the sport's adaptability ensures its enduring relevance across vastly different landscapes.",
      "From massive grandstands to the fast-paced, close-quarters technicality of futsal played on urban courts, the core objective of the game continues to captivate millions globally.",
    ],
  ],
  [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "The critical turning point for the game's standardization happened in 1863 as different local groups came together to create a single rulebook.",
      targetKeywords: ["standardization", "1863", "single", "rulebook"],
      strongLocator: "1863",
      correctSentenceId: "s5",
      locatorSentenceIds: ["s5", "s6"],
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "As a result, the casual pastime quickly evolved into a profitable business that attracted enormous numbers of ticket-buying fans.",
      targetKeywords: ["casual", "pastime", "profitable", "business", "ticket-buying", "fans"],
      strongLocator: null,
      correctSentenceId: "s8",
      locatorSentenceIds: [],
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "The creation of FIFA was mainly motivated by the pressing requirement to manage and control the increasing volume of cross-border matches.",
      targetKeywords: ["creation", "FIFA", "cross-border", "matches"],
      strongLocator: "FIFA",
      correctSentenceId: "s11",
      locatorSentenceIds: ["s11", "s10"],
    },
  ],
);

export const L0_PRACTICE_2_SPACE = buildContent(
  "The Billionaire Space Race: Mars as the Next Human Frontier",
  [
    [
      "For decades, space exploration was the exclusive domain of government-funded national space agencies.",
      "However, the 21st century has witnessed a paradigm shift, characterized by the rapid privatization of aerospace engineering.",
      "A new era of commercial competition has emerged, driven by visionary entrepreneurs who view interplanetary colonization not as science fiction, but as an inevitable necessity for long-term human survival.",
    ],
    [
      "The sheer scale of this ambition is most evident in the logistical challenges of reaching the Red Planet.",
      "Because the orbital paths of Earth and its planetary neighbor are elliptical, the minimum distance between them fluctuates dramatically, averaging approximately 225 million kilometers.",
      "Traversing this immense void requires unprecedented technological advancements in propulsion systems to ensure that spacecraft can safely transport heavy payloads and human crews across the solar system.",
    ],
    [
      "Beyond the initial journey, engineers must resolve substantial obstacles regarding extraterrestrial habitation.",
      "Establishing a permanent settlement demands the creation of self-sustaining ecosystems capable of producing breathable air, drinkable water, and agricultural yields within a completely hostile environment.",
      "Innovators are currently prioritizing the development of closed-loop life support architectures that can recycle essential resources with near-perfect efficiency.",
    ],
    [
      "Leading the charge in these practical applications is SpaceX, which has fundamentally revolutionized the aerospace industry by manufacturing reusable launch vehicles.",
      "By successfully recovering and relaunching primary rocket boosters, the corporation has drastically reduced the exorbitant costs previously associated with escaping Earth's gravitational pull.",
      "This economic breakthrough is widely considered the critical first step in making regular interplanetary transit a financially viable enterprise.",
    ],
    [
      "Ultimately, the transition from an Earth-bound species to a multi-planetary civilization hinges on the sustained financial and intellectual investments of these private enterprises.",
      "While the timeline for a fully operational Martian colony remains highly speculative, the accelerated pace of current technological innovation suggests that human footprints on another world may be witnessed within our lifetime.",
    ],
  ],
  [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "The typical gap separating our world from the adjacent planet is around 225 million kilometers due to their oval-shaped trajectories.",
      targetKeywords: ["typical", "gap", "225", "million", "kilometers", "oval-shaped", "trajectories"],
      strongLocator: "225 million kilometers",
      correctSentenceId: "s5",
      locatorSentenceIds: ["s5", "s4"],
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "Researchers are presently focusing on designing self-contained survival systems able to reuse vital materials almost flawlessly.",
      targetKeywords: ["presently", "focusing", "self-contained", "survival", "systems", "reuse", "vital", "materials"],
      strongLocator: null,
      correctSentenceId: "s9",
      locatorSentenceIds: [],
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "The prominent company SpaceX has completely transformed the sector by producing spacecraft parts that can be flown multiple times.",
      targetKeywords: ["completely", "transformed", "SpaceX", "flown", "multiple", "times"],
      strongLocator: "SpaceX",
      correctSentenceId: "s10",
      locatorSentenceIds: ["s10", "s11"],
    },
  ],
);

export const L0_PRACTICE_3_CINEMA = buildContent(
  "The Global Ascendancy of South Indian Cinema: Beyond Linguistic Boundaries",
  [
    [
      "Historically, the Indian cinematic landscape was overwhelmingly dominated by the Hindi film industry, commonly known as Bollywood.",
      "Regional cinema, particularly from the southern states, operated within strict linguistic and geographical confines, catering predominantly to local demographics.",
      "However, the last decade has witnessed a dramatic paradigm shift, with southern film industries breaking out of their traditional territories to achieve unprecedented mainstream and international success.",
    ],
    [
      "The initial catalyst for this rapid expansion occurred when sophisticated audio synchronization techniques became commercially viable.",
      "In 2012, the widespread broadcasting of Hindi-dubbed South Indian romantic comedies began capturing massive audiences across non-traditional regions, proving that humor and emotional narratives could easily transcend language barriers.",
      "Viewers who previously had no access to these cultural stories were suddenly introduced to a fresh, highly engaging style of storytelling directly in their living rooms.",
    ],
    [
      "Consequently, this widespread television popularity paved the way for monumental theatrical achievements.",
      "Production houses started creating larger-than-life action sequences that yielded unprecedented financial returns at theaters nationwide.",
      "These ambitious projects effectively challenged the established hierarchy of the Indian entertainment industry, demonstrating that regional narratives possessed the sheer scale and universal appeal required to dominate the domestic box office.",
    ],
    [
      "In the contemporary era, international digital platforms have recognized this lucrative market and actively acquire these regional masterpieces to satisfy growing global demand.",
      "Visionary filmmakers like Rajamouli have leveraged these global distribution channels to showcase their grand visual spectacles to viewers far beyond the Indian subcontinent.",
      "This seamless fusion of localized emotion with cutting-edge visual effects has ultimately redefined the global perception of Indian filmmaking, cementing the industry's status as a formidable cultural export.",
    ],
  ],
  [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "During 2012, the extensive television transmission of localized romantic films started attracting enormous viewer demographics in previously untapped territories.",
      targetKeywords: ["2012", "extensive", "television", "transmission", "attracting", "enormous", "viewer", "demographics"],
      strongLocator: "2012",
      correctSentenceId: "s5",
      locatorSentenceIds: ["s5", "s4"],
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "Film studios began producing extravagant combat scenes which generated unparalleled monetary profits across cinemas throughout the country.",
      targetKeywords: ["Film", "studios", "extravagant", "combat", "scenes", "unparalleled", "monetary", "profits"],
      strongLocator: null,
      correctSentenceId: "s8",
      locatorSentenceIds: [],
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "Innovative directors such as Rajamouli have utilized worldwide streaming networks to present their immense cinematic creations to international audiences.",
      targetKeywords: ["Innovative", "directors", "Rajamouli", "worldwide", "streaming", "networks"],
      strongLocator: "Rajamouli",
      correctSentenceId: "s11",
      locatorSentenceIds: ["s11", "s10"],
    },
  ],
);

export const L0_FINAL_1_FORENSICS = buildContent(
  "The Evolution of Forensics: Catching the World's Most Infamous Thieves",
  [
    [
      "For centuries, the apprehension of skilled criminals relied almost entirely on eyewitness testimonies and physical pursuit.",
      "Traditional law enforcement possessed very few tools to link a suspect to a crime scene once the perpetrator had successfully fled the area.",
      "Consequently, highly organized thieves could operate with relative impunity, knowing that absent a direct witness, their chances of capture and subsequent prosecution were minimal.",
    ],
    [
      "The landscape of criminal justice underwent a monumental transformation during the late twentieth century.",
      "A profound breakthrough in investigative procedures occurred in 1984, when scientists officially pioneered the technique of extracting and matching human genetic material.",
      "This revolutionary development meant that microscopic biological traces left at a scene could act as an undeniable physiological signature, completely changing how crime scenes were processed.",
    ],
    [
      "Following this discovery, police departments worldwide enthusiastically integrated these laboratory-based examinations to successfully close numerous historical burglaries that had previously lacked any viable leads.",
      "The realization that invisible fragments could betray their presence forced criminals to drastically alter their methods, often wearing specialized protective gear to avoid leaving any trace evidence behind.",
    ],
    [
      "Despite these new precautions, the sheer precision of modern science eventually outmatched even the most meticulous criminals.",
      "The incredible efficacy of this scientific approach was prominently showcased when the notorious art thief Vincenzo was decisively captured after investigators found a singular strand of hair on a discarded picture frame.",
      "Such high-profile apprehensions firmly established laboratory science as the ultimate weapon against sophisticated theft and illegal smuggling operations globally.",
    ],
  ],
  [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "A significant advancement in detective methods took place in 1984, as researchers formally introduced the process of isolating and comparing people's biological makeup.",
      targetKeywords: ["1984", "detective", "methods", "biological", "makeup"],
      strongLocator: "1984",
      correctSentenceId: "s5",
      locatorSentenceIds: ["s5", "s6"],
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "In the aftermath of this innovation, global law enforcement agencies eagerly adopted these clinical tests to effectively solve many past thefts that formerly had no clear clues.",
      targetKeywords: ["global", "law", "enforcement", "clinical", "tests", "past", "thefts"],
      strongLocator: null,
      correctSentenceId: "s7",
      locatorSentenceIds: [],
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "The remarkable effectiveness of these analytical methods was clearly highlighted when the infamous cultural artifact robber Vincenzo was finally detained following the discovery of an isolated hair follicle on an abandoned frame.",
      targetKeywords: ["Vincenzo", "analytical", "methods", "isolated", "hair", "follicle"],
      strongLocator: "Vincenzo",
      correctSentenceId: "s10",
      locatorSentenceIds: ["s10", "s9"],
    },
  ],
);

export const L0_FINAL_2_COFFEE = buildContent(
  "The Coffee Economy: How a Bitter Bean Conquered the World",
  [
    [
      "The journey of the coffee bean from an obscure berry to a global economic powerhouse is a testament to the power of international trade.",
      "Initially discovered in the lush highlands of East Africa, the stimulating properties of the plant were highly guarded secrets.",
      "Early cultivation was tightly restricted to specific geographic regions, preventing the broader world from accessing the botanical source of this energizing beverage.",
    ],
    [
      "For centuries, strict regulations ensured that only roasted, infertile beans were allowed to leave the original growing territories, preventing any rival nations from establishing competing plantations.",
      "The bustling port cities of the Middle East became the exclusive hubs for this highly sought-after commodity, dictating prices and controlling the flow of goods into the eager European markets.",
    ],
    [
      "The stringent export monopoly maintained by Yemen was eventually broken when foreign merchants successfully smuggled live seedlings to their overseas territories.",
      "This dramatic act of botanical espionage effectively decentralized production, allowing vast new plantations to flourish rapidly in various tropical climates located around the equator.",
    ],
    [
      "The sudden availability of new cultivation grounds completely transformed the agricultural landscape of several continents.",
      "Consequently, this lucrative agricultural product rapidly evolved into a foundational pillar of global commerce, heavily influencing the financial stability of numerous developing nations.",
      "Entire national infrastructures were soon built almost entirely around the harvesting, processing, and transportation of this single cash crop.",
    ],
    [
      "Today, the intricate network of supply chains spans across oceans, connecting rural farmers with urban consumers in a multibillion-dollar industry.",
      "In contemporary agricultural markets, the milder flavor profile continues to dominate international consumption, currently accounting for approximately 60% of all global coffee exports.",
      "The remaining market share is largely sustained by hardier, more bitter botanical varieties that are favored in instant beverage manufacturing.",
    ],
  ],
  [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "The strict international sales control held by Yemen was finally shattered once foreign traders covertly transported living plants to their distant colonies.",
      targetKeywords: ["Yemen", "sales", "control", "covertly", "transported"],
      strongLocator: "Yemen",
      correctSentenceId: "s6",
      locatorSentenceIds: ["s6", "s5"],
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "As a result, this highly profitable farming crop quickly turned into a central component of worldwide trade, strongly impacting the economic security of many emerging countries.",
      targetKeywords: ["profitable", "farming", "crop", "worldwide", "trade", "economic", "security"],
      strongLocator: null,
      correctSentenceId: "s9",
      locatorSentenceIds: [],
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "Within modern farming industries, the gentler tasting option remains at the forefront of worldwide usage, presently making up roughly 60% of all international shipments in this sector.",
      targetKeywords: ["60%", "modern", "farming", "industries", "gentler", "tasting", "option"],
      strongLocator: "60%",
      correctSentenceId: "s12",
      locatorSentenceIds: ["s12", "s11"],
    },
  ],
);

export const L0_FINAL_3_JELLYFISH = buildContent(
  "The Immortal Jellyfish: Unlocking the Biological Secrets of Aging",
  [
    [
      "The biological aging process is universally recognized as a one-way trajectory, an inevitable decline that affects nearly all complex organisms on Earth.",
      "However, the discovery of Turritopsis dohrnii, colloquially known as the immortal jellyfish, has fundamentally challenged the traditional understanding of cellular mortality.",
      "This remarkably resilient species possesses the unprecedented ability to reverse its own life cycle, effectively bypassing the natural process of death under certain conditions.",
    ],
    [
      "The extraordinary regenerative abilities of this microscopic organism were first documented by marine biologists in the year 1988 during a routine survey of Mediterranean marine life.",
      "Researchers unexpectedly observed that instead of expiring after reaching sexual maturity, the captive specimens were mysteriously reverting to their earliest developmental stage.",
      "This groundbreaking observation initiated decades of intensive scientific inquiry into the mechanics of biological age reversal.",
    ],
    [
      "The secret behind this unparalleled survival strategy lies within a rare cellular mechanism known as transdifferentiation.",
      "When confronted with severe environmental stress or physical injury, the mature adult form does not perish but instead actively transforms its existing cells into a younger, juvenile state.",
      "This radical metamorphosis allows the organism to effectively hit a biological reset button, beginning its life cycle anew as a colonial polyp attached to the ocean floor.",
    ],
    [
      "Unsurprisingly, the profound implications of this biological anomaly have captured the attention of the global medical community.",
      "By mapping the pathways that allow for such radical cellular restructuring, scientists hope to identify parallel mechanisms that might be dormant within human biology.",
      "Consequently, prominent research teams at Kyoto University are currently analyzing the genetic sequence of the creature to potentially unlock new therapies for age-related human diseases.",
    ],
    [
      "Despite these promising avenues of investigation, experts caution that a direct translation of these biological mechanisms into human medical applications remains decades away.",
      "The immortal jellyfish is structurally simplistic, and replicating its cellular alchemy in highly complex mammalian systems presents extraordinary challenges.",
      "Nevertheless, this tiny hydrozoan continues to serve as a vital key in unraveling the deepest mysteries of the aging process.",
    ],
  ],
  [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "The remarkable healing capabilities of this tiny creature were initially recorded by ocean researchers in 1988 throughout a standard examination of Mediterranean aquatic ecosystems.",
      targetKeywords: ["1988", "remarkable", "healing", "capabilities", "initially", "recorded"],
      strongLocator: "1988",
      correctSentenceId: "s4",
      locatorSentenceIds: ["s4", "s5"],
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "Upon facing intense ecological pressure or bodily harm, the fully grown creature avoids death by converting its current biology back into an adolescent phase.",
      targetKeywords: ["ecological", "pressure", "avoids", "death", "adolescent", "phase"],
      strongLocator: null,
      correctSentenceId: "s8",
      locatorSentenceIds: [],
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "As a result, leading academic groups at Kyoto University are presently examining the DNA structure of the animal with the goal of discovering novel treatments for human conditions associated with getting older.",
      targetKeywords: ["Kyoto", "University", "examining", "DNA", "structure", "novel", "treatments"],
      strongLocator: "Kyoto University",
      correctSentenceId: "s12",
      locatorSentenceIds: ["s12", "s11"],
    },
  ],
);

export const L0_PRACTICE_TESTS_BULK_PAYLOAD = {
  practiceTests: [
    {
      title: "L0 — Practice 1: The Evolution of Football",
      passType: "BAND" as const,
      passValue: 0,
      timeLimitMinutes: 25,
      maxAttempts: null,
      gamlishScanning: L0_PRACTICE_1_FOOTBALL,
    },
    {
      title: "L0 — Practice 2: Billionaire Space Race",
      passType: "BAND" as const,
      passValue: 0,
      timeLimitMinutes: 25,
      maxAttempts: null,
      gamlishScanning: L0_PRACTICE_2_SPACE,
    },
    {
      title: "L0 — Practice 3: South Indian Cinema",
      passType: "BAND" as const,
      passValue: 0,
      timeLimitMinutes: 25,
      maxAttempts: null,
      gamlishScanning: L0_PRACTICE_3_CINEMA,
    },
  ],
};

export const L0_FINAL_TESTS_BULK_PAYLOAD = {
  finalTests: [
    {
      title: "L0 — Final 1: Forensics",
      timeLimitMinutes: 25,
      gamlishScanning: L0_FINAL_1_FORENSICS,
    },
    {
      title: "L0 — Final 2: Coffee Economy",
      timeLimitMinutes: 25,
      gamlishScanning: L0_FINAL_2_COFFEE,
    },
    {
      title: "L0 — Final 3: Immortal Jellyfish",
      timeLimitMinutes: 25,
      gamlishScanning: L0_FINAL_3_JELLYFISH,
    },
  ],
};
