import type { GamlishTfngContentAuthoringPreview } from "@/src/lib/api/adminReadingVersions";

export const L1_TFNG_BRIEFING =
  "Mission: Determine whether the statements are True, False, or Not Given.";

export const L1_TFNG_PRO_TIP =
  'Your task is to identify the logical link between the statement and the passage. Only one of these questions is anchored by a "GPS" locator keyword. The others rely on conceptual scanning. You must locate the anchor to unlock the passage, then use your reading skills to solve the surrounding block. Be careful, as some questions look like they have keywords but do not!';

type QuestionDef = GamlishTfngContentAuthoringPreview["questions"][number];
type ErrorTagDef = NonNullable<GamlishTfngContentAuthoringPreview["errorTags"]>[number];

function buildParagraphs(
  paragraphSentences: string[][],
): GamlishTfngContentAuthoringPreview["paragraphs"] {
  let sentenceCounter = 0;
  return paragraphSentences.map((sentences, index) => ({
    id: `p${index + 1}`,
    sentences: sentences.map((text) => {
      sentenceCounter += 1;
      return { id: `s${sentenceCounter}`, text };
    }),
  }));
}

function buildContent(
  passageTitle: string,
  paragraphSentences: string[][],
  questions: [QuestionDef, QuestionDef, QuestionDef, QuestionDef],
  errorTags: [ErrorTagDef, ErrorTagDef, ErrorTagDef, ErrorTagDef],
): GamlishTfngContentAuthoringPreview {
  return {
    passageTitle,
    briefing: L1_TFNG_BRIEFING,
    proTip: L1_TFNG_PRO_TIP,
    instruction: "Determine whether each statement is TRUE, FALSE, or NOT GIVEN.",
    paragraphs: buildParagraphs(paragraphSentences),
    questions,
    errorTags,
  };
}

export const L1_PRACTICE_1 = buildContent(
  "The Dopamine Loop: Modern Psychology and the Scrolling Habit",
  [
    [
      "In recent years, the exponential growth of social networking platforms has transformed how humanity consumes information.",
      "Originally conceptualized as digital public squares for interpersonal connection, these applications have evolved into highly sophisticated attention economies.",
      "The underlying mechanics of these systems rely heavily on exploiting fundamental human psychology to maximize user retention.",
    ],
    [
      "Central to this user retention is the neurotransmitter dopamine, which regulates the brain's reward and pleasure centers.",
      "Every notification, like, or comment serves as a micro-stimulus, providing a brief chemical reward.",
      "Over time, the brain begins to crave these erratic validations, leading to a compulsive need to refresh feeds and check for updates, often at the expense of real-world interactions.",
    ],
    [
      "Modern digital ecosystems are deliberately engineered to trigger habitual behavior through continuous, unpredictable feedback loops.",
      "By utilizing variable reward schedules, similar to the mechanisms found in slot machines, developers ensure that users remain perpetually engaged.",
      "The profound effects of this conditioning were recently quantified.",
      "Specifically, a comprehensive assessment by the 2026 Murdoch Children’s Research Institute concluded that individuals under the age of eighteen are the most susceptible to psychological distress stemming from prolonged online usage.",
    ],
    [
      "Furthermore, the physiological consequences of excessive screen time are substantial.",
      "While it is widely documented that the blue light emitted by handheld displays disrupts circadian rhythms, researchers are still investigating the full range of environmental variables contributing to melatonin depletion.",
      "To combat these neurological impacts, academic institutions have begun experimenting with offline paradigms.",
      "Preliminary data demonstrate that implementing strict technology-free intervals significantly enhances the cognitive endurance of learners during complex tasks.",
    ],
    [
      "Ultimately, breaking the dopamine loop requires conscious behavioral modification.",
      "By understanding the underlying architecture of digital platforms, individuals can begin to construct healthier boundaries.",
      "Cultivating a lifestyle where offline activities offer richer, more sustained rewards is essential for reducing reliance on superficial digital validation.",
    ],
  ],
  [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "Contemporary social networks are purposefully designed to instigate repetitive actions via ongoing, unpredictable reinforcement cycles.",
      targetKeywords: [
        "Contemporary social networks",
        "purposefully designed",
        "instigate repetitive actions",
        "reinforcement cycles",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "TRUE",
      correctSentenceId: "s7",
      logic:
        "The statement perfectly paraphrases the passage's claim about digital ecosystems being engineered to trigger habitual behavior through feedback loops.",
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "According to the 2026 Murdoch Children’s Research Institute, minors experience the highest levels of mental anguish caused by prolonged internet engagement.",
      targetKeywords: [
        "2026 Murdoch Children’s Research Institute",
        "minors",
        "highest levels",
        "mental anguish",
      ],
      isAnchor: true,
      anchorPhrase: "2026 Murdoch Children’s Research Institute",
      correctAnswer: "TRUE",
      correctSentenceId: "s10",
      logic:
        '"Individuals under the age of eighteen" paraphrases "minors," and "most susceptible to psychological distress" matches "highest levels of mental anguish." The Anchor keyword exactly matches the text.',
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "The reduction of the sleep hormone melatonin is entirely caused by the artificial glare of mobile devices.",
      targetKeywords: [
        "reduction",
        "sleep hormone melatonin",
        "entirely caused",
        "artificial glare",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "NOT GIVEN",
      correctSentenceId: "s12",
      logic:
        "The text mentions that blue light disrupts rhythms and that researchers are studying variables contributing to melatonin depletion. However, it does not state that blue light is the entire/sole cause.",
    },
    {
      id: "q4",
      label: "Q4",
      order: 4,
      questionStatement:
        "Enforcing periods without electronic devices noticeably improves students' mental stamina.",
      targetKeywords: [
        "Enforcing periods",
        "without electronic devices",
        "noticeably improves",
        "students' mental stamina",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "TRUE",
      correctSentenceId: "s13",
      logic:
        '"Technology-free intervals" matches "periods without electronic devices," and "enhances the cognitive endurance of learners" perfectly matches "improves students\' mental stamina."',
    },
  ],
  [
    {
      tag: "Anchor Missed",
      trigger: "User searches for keywords in Q1, Q3, or Q4 instead of locating the anchor first.",
      feedback:
        "You are searching blindly! Identify the one question with a distinct anchor (a specific name and date) to unlock the passage and find your starting point.",
    },
    {
      tag: "Sequence Break",
      trigger: "User picks a sentence out of order.",
      feedback:
        "IELTS questions follow the text flow. The answer to Question 1 must appear before the Anchor in the text!",
    },
    {
      tag: "Logical Fallacy",
      trigger:
        "User identifies the right location for Q1 or Q4 but answers incorrectly due to misinterpreting a synonym.",
      feedback:
        "You found the correct location, but the logic does not match. Ensure you are mapping the paraphrased concepts accurately.",
    },
    {
      tag: "Not Given Blindness",
      trigger:
        "User marks Q3 as True because they see the words 'blue light' and 'melatonin' in the text.",
      feedback:
        "Watch out for extreme qualifiers! The text mentions blue light and melatonin, but does it claim it is 'entirely caused' by it? If the text lacks this definitive proof, it is Not Given.",
    },
  ],
);

export const L1_PRACTICE_2 = buildContent(
  "The Cost of Connection: Hyper-connectivity and Cognitive Load",
  [
    [
      "In the contemporary era, the paradigm of constant digital accessibility has fundamentally altered human communication patterns.",
      "While global integration is often heralded as a triumph of modern engineering, the psychological toll of maintaining an unrelenting online presence is becoming increasingly evident in clinical observations.",
    ],
    [
      'A significant outcome of this hyper-connectivity is the phenomenon known as "continuous partial attention."',
      "Individuals often oscillate between multiple digital streams, resulting in a fractured cognitive state.",
      "This state prevents the sustained focus necessary for deep work, leading to a perceptible decline in overall intellectual productivity.",
    ],
    [
      "The 2025 Meta-Analysis of Global Digital Behavior indicates that the psychological pressure to remain permanently visible correlates directly with higher levels of cortisol in high-frequency social media users.",
      "This empirical evidence suggests that our biology is struggling to adapt to the velocity of information exchange facilitated by current network infrastructures.",
    ],
    [
      "Furthermore, the erosion of privacy boundaries has fostered an environment of perpetual performance.",
      "Users frequently feel compelled to curate an idealized persona, which can exacerbate feelings of inadequacy and emotional fatigue.",
      "This constant self-monitoring represents a significant deviation from traditional social interaction norms.",
    ],
    [
      "Ultimately, while digital tools offer undeniable logistical benefits, the habit of unrestricted connectivity necessitates a cautious approach.",
      "Mitigating these consequences requires a deliberate effort to establish boundaries that protect cognitive resources and promote mental well-being in an increasingly demanding digital landscape.",
    ],
  ],
  [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "Multitasking across various digital platforms frequently inhibits an individual's ability to achieve deep mental concentration.",
      targetKeywords: [
        "Multitasking",
        "various digital platforms",
        "inhibits",
        "deep mental concentration",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "TRUE",
      correctSentenceId: "s5",
      logic:
        "The text confirms that shifting attention between streams causes a loss of the focus required for profound productivity.",
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "According to the 2025 Meta-Analysis of Global Digital Behavior, there is a link between extreme social media use and elevated stress hormones.",
      targetKeywords: [
        "2025 Meta-Analysis of Global Digital Behavior",
        "link",
        "extreme social media use",
        "elevated stress hormones",
      ],
      isAnchor: true,
      anchorPhrase: "2025 Meta-Analysis of Global Digital Behavior",
      correctAnswer: "TRUE",
      correctSentenceId: "s6",
      logic:
        'The statement matches the data provided in the anchor sentence, with "elevated stress hormones" paraphrasing "higher levels of cortisol".',
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "Chronic users of social media frequently suffer from permanent physiological damage as a result of cortisol overproduction.",
      targetKeywords: [
        "Chronic users",
        "permanent physiological damage",
        "cortisol overproduction",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "NOT GIVEN",
      correctSentenceId: "s7",
      logic:
        'The text mentions that cortisol levels correlate with usage, but it does not claim that the damage is "permanent" or that it leads to irreversible physiological injury.',
    },
    {
      id: "q4",
      label: "Q4",
      order: 4,
      questionStatement:
        "The practice of presenting a perfected version of oneself online is a common behavior that contrasts with historical modes of human engagement.",
      targetKeywords: [
        "presenting a perfected version",
        "common behavior",
        "contrasts with historical modes of human engagement",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "TRUE",
      correctSentenceId: "s10",
      logic:
        'The statement accurately reflects the text\'s observation on the shift in social interaction norms. "Perfected version" paraphrases "idealized persona".',
    },
  ],
  [
    {
      tag: "Anchor Missed",
      trigger: "User searches for keywords in Q1, Q3, or Q4 instead of locating the anchor first.",
      feedback:
        "You are searching blindly! Identify the specific research title in Question 2 to unlock the passage and find your starting point.",
    },
    {
      tag: "Sequence Break",
      trigger: "User picks a sentence out of order.",
      feedback:
        "IELTS questions follow the text flow. Check the order of your identified sentences.",
    },
    {
      tag: "Logical Fallacy",
      trigger:
        "User identifies the right location but answers incorrectly due to misinterpreting a synonym.",
      feedback:
        "You found the correct location, but the logic does not match. The text discusses cortisol levels but does not state anything about permanent physiological damage.",
    },
    {
      tag: "Not Given Blindness",
      trigger:
        "User marks Q3 as True or False based on the mention of biology.",
      feedback:
        "The text discusses biological adaptation and stress indicators, but does not provide details on long-term physiological permanence. This claim is Not Given.",
    },
  ],
);

export const L1_PRACTICE_3 = buildContent(
  "Architecture of Boredom: Building a Life Outside the Screen",
  [
    [
      "In the modern era, the compulsion to fill every vacant moment with digital stimulation has nearly eradicated the experience of natural boredom.",
      "Historically, periods of mental inactivity were recognized as crucial incubators for creativity and problem solving.",
      "Today, the immediate availability of digital entertainment has replaced these quiet intervals with a continuous stream of algorithms.",
    ],
    [
      "The psychological cost of this constant engagement is profound.",
      "Without the mental space to wander, the brain becomes conditioned to expect immediate gratification.",
      "This shift diminishes our capacity to engage in prolonged and complex tasks that do not offer instant rewards.",
    ],
    [
      "To counter this trend, experts advocate for the deliberate cultivation of an offline existence.",
      "The core philosophy involves designing a physical reality that is sufficiently engaging to render digital distractions unappealing.",
      "These offline pursuits demand a bodily involvement that virtual environments cannot replicate.",
      "According to the prominent cognitive psychologist Dr. Aris Thorne, individuals who intentionally schedule analog pastimes report a significant reduction in their desire to open social applications.",
    ],
    [
      "Furthermore, engaging in tactile pursuits fosters a deeper sense of accomplishment.",
      "Crafting, woodworking, and community gardening require patience and sustained focus.",
      "While numerous people assume that tactile hobbies require excessive financial resources, the actual monetary investment varies significantly.",
      "The primary benefit lies in the gradual development of a tangible skill, which provides a more profound psychological reward than superficial digital validation.",
    ],
    [
      "Ultimately, reclaiming human attention requires a structural redesign of daily habits.",
      "By intentionally welcoming quiet moments and substituting screen time with meaningful physical activities, individuals can break free from the digital feedback loop.",
    ],
  ],
  [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "The central idea of an offline lifestyle is to create practical situations that are fascinating enough to make electronic interruptions unattractive.",
      targetKeywords: [
        "central idea",
        "offline lifestyle",
        "practical situations",
        "electronic interruptions unattractive",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "TRUE",
      correctSentenceId: "s8",
      logic:
        '"Central idea" paraphrases "core philosophy," and making electronic interruptions unattractive matches "render digital distractions unappealing."',
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "Virtual spaces are fully capable of recreating the physical engagement required by real world tasks.",
      targetKeywords: [
        "Virtual spaces",
        "fully capable",
        "recreating",
        "physical engagement",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "FALSE",
      correctSentenceId: "s9",
      logic:
        "The statement directly contradicts the text, which states that virtual environments cannot replicate bodily involvement.",
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "Observations made by Dr. Aris Thorne show that those who deliberately plan non electronic leisure activities feel less compulsion to use digital networks.",
      targetKeywords: [
        "Dr. Aris Thorne",
        "deliberately plan",
        "non electronic leisure activities",
        "less compulsion",
      ],
      isAnchor: true,
      anchorPhrase: "Dr. Aris Thorne",
      correctAnswer: "TRUE",
      correctSentenceId: "s10",
      logic:
        'The statement accurately paraphrases the psychologist\'s findings. "Less compulsion" matches "significant reduction in their desire."',
    },
    {
      id: "q4",
      label: "Q4",
      order: 4,
      questionStatement:
        "A large percentage of people abandon their tactile hobbies within the first year due to escalating costs.",
      targetKeywords: [
        "large percentage of people",
        "abandon their tactile hobbies",
        "within the first year",
        "escalating costs",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "NOT GIVEN",
      correctSentenceId: "s13",
      logic:
        "The text mentions that people assume these hobbies require excessive financial resources and that the investment varies. However, it never states that people actually abandon them within the first year because of the cost.",
    },
  ],
  [
    {
      tag: "Anchor Missed",
      trigger: "User searches for keywords in Q1, Q2, or Q4 instead of locating the anchor first.",
      feedback:
        "You are searching blindly! Identify the specific psychologist's name in Question 3 to unlock the passage and find your starting point.",
    },
    {
      tag: "Sequence Break",
      trigger: "User picks a sentence out of order.",
      feedback:
        "IELTS questions follow the text flow. If you found the answer for Question 3, Question 2 must be located above it!",
    },
    {
      tag: "Logical Fallacy",
      trigger:
        "User identifies the right location for Question 2 but answers True.",
      feedback:
        "You found the correct location, but you missed the negative qualifier. The text says virtual environments 'cannot replicate' the physical presence, which makes the statement False.",
    },
    {
      tag: "Not Given Blindness",
      trigger:
        "User marks Q4 as True or False based on the mention of financial resources.",
      feedback:
        "The text discusses the assumption of high costs, but does it mention people abandoning hobbies in the first year? Since the timeline and the action of quitting are missing, this claim is Not Given.",
    },
  ],
);

export const L1_FINAL_1 = buildContent(
  "The Academic Deficit: Impact on Student Productivity",
  [
    [
      "The integration of digital technology into educational environments has revolutionized access to information.",
      "However, the ubiquitous presence of smartphones has simultaneously introduced unprecedented challenges to student productivity.",
      "The constant temptation to engage with social networks often overrides the necessity for sustained academic effort.",
    ],
    [
      "A primary concern is the cognitive switching penalty incurred during study sessions.",
      "Students frequently underestimate the time required to regain maximum concentration after checking their devices.",
      "This continuous fragmentation of attention severely limits their capacity to absorb new material.",
      "Quantifying this issue, a comprehensive study presented at the 2024 Global Education Summit revealed that excessive networking app usage directly correlates with lowered academic performance across various demographics.",
    ],
    [
      "Furthermore, the medium through which students consume information plays a critical role in overall comprehension.",
      "Digital texts promote a rapid scanning behavior that significantly reduces the retention of complex arguments.",
      "To reclaim lost preparation time, numerous educators highly recommend the implementation of strict digital curfews before major assessments.",
      "This deliberate disconnection allows the brain to process and consolidate information more effectively.",
    ],
    [
      "Ultimately, securing adequate time for academic preparation requires a proactive approach to technology management.",
    ],
    [
      "By recognizing the detrimental impact of constant connectivity, learners can establish environments conducive to deep cognitive work and better overall scholastic outcomes.",
    ],
  ],
  [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "Learners typically overestimate how long it takes to achieve deep focus following a digital interruption.",
      targetKeywords: [
        "Learners",
        "overestimate",
        "how long it takes",
        "digital interruption",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "FALSE",
      correctSentenceId: "s5",
      logic:
        'The passage states that students "underestimate" the time required to regain concentration, so this statement is the opposite.',
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "Data from the 2024 Global Education Summit demonstrates a clear link between heavy use of social platforms and poorer scholastic results.",
      targetKeywords: [
        "2024 Global Education Summit",
        "clear link",
        "heavy use",
        "poorer scholastic results",
      ],
      isAnchor: true,
      anchorPhrase: "2024 Global Education Summit",
      correctAnswer: "TRUE",
      correctSentenceId: "s7",
      logic:
        'The statement paraphrases the passage: "poorer scholastic results" aligns with "lowered academic performance."',
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "Reading materials on electronic screens greatly enhances a student's ability to remember complicated concepts.",
      targetKeywords: [
        "electronic screens",
        "greatly enhances",
        "ability to remember",
        "complicated concepts",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "FALSE",
      correctSentenceId: "s9",
      logic:
        'The text says digital reading "significantly reduces the retention of complex arguments," which contradicts "greatly enhances."',
    },
    {
      id: "q4",
      label: "Q4",
      order: 4,
      questionStatement:
        "Most university students successfully adhere to digital curfews during their final examination weeks.",
      targetKeywords: [
        "Most university students",
        "successfully adhere",
        "digital curfews",
        "final examination weeks",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "NOT GIVEN",
      correctSentenceId: "s10",
      logic:
        'The text says educators recommend curfews, but it does not state whether students actually follow them.',
    },
  ],
  [
    {
      tag: "Anchor Missed",
      trigger: "User searches for keywords in Q1, Q3, or Q4 instead of locating the anchor first.",
      feedback:
        "You are searching blindly! Identify the specific event name and date in Question 2 to unlock the passage and find your starting point.",
    },
    {
      tag: "Sequence Break",
      trigger: "User picks a sentence out of order.",
      feedback:
        "IELTS questions follow the text flow. If you found the Anchor in paragraph 2, the answer for Question 3 must be located below it!",
    },
    {
      tag: "Logical Fallacy",
      trigger:
        "User identifies the right location for Question 1 or Question 3 but answers True.",
      feedback:
        "You found the correct location, but you fell into an antonym trap! Pay close attention to words like 'underestimate' versus 'overestimate', or 'reduces' versus 'enhances'. They flip the meaning entirely, making the statement False.",
    },
    {
      tag: "Not Given Blindness",
      trigger:
        "User marks Q4 as True because they see the words 'digital curfews'.",
      feedback:
        "The text mentions that teachers recommend curfews, but does it confirm that students actually follow them? Since the action of 'successfully adhering' is missing, this claim is Not Given.",
    },
  ],
);

export const L1_FINAL_2 = buildContent(
  "The Illusion of Validation: Imposter Syndrome and Social Comparison",
  [
    [
      "The expansion of the digital landscape has drastically altered the way individuals perceive their own success.",
      "Unlike traditional communities where achievements were shared locally, modern applications allow users to broadcast their triumphs to a global audience.",
      "This constant stream of curated success stories has created a unique psychological environment.",
    ],
    [
      "A core component of this environment is the suppression of failure.",
      "Users rarely document their struggles, opting instead to present a flawless narrative.",
      "This creates a skewed representation of reality, making it difficult for the average person to accurately gauge normal human progression.",
      "The resulting pressure to maintain a perfect image can lead to significant emotional distress.",
    ],
    [
      "The architecture of these networks encourages the presentation of an idealized lifestyle.",
      "Regular exposure to highly polished images frequently triggers a phenomenon where individuals evaluate their own lives negatively.",
      "Although users logically understand that these photographs are digitally altered, the subconscious feeling of inadequacy usually persists.",
      "A landmark observation from the Institute of Cyberpsychology in Vienna demonstrated a sharp increase in imposter syndrome among heavy platform users.",
    ],
    [
      "These individuals reported a constant fear of being exposed as frauds in their real lives.",
      "Consequently, mitigating this phenomenon requires active cognitive restructuring.",
      "While clinical therapists suggest limiting daily browsing time to reduce anxiety, they are still recording data to determine if complete digital abstinence actually improves long term mental stability.",
      "The ultimate goal is to cultivate a self worth that is completely independent of online metrics.",
    ],
    [
      "Ultimately, navigating the modern digital ecosystem requires a high degree of media literacy.",
      "Recognizing the artificial nature of online validation is the first step toward building genuine confidence.",
      "Society must shift its focus from virtual approval to authentic, real world accomplishments.",
    ],
  ],
  [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "Viewing perfected representations of others often causes people to assess their personal situations in an unfavorable light.",
      targetKeywords: [
        "Viewing perfected representations of others",
        "often causes",
        "assess their personal situations",
        "unfavorable light",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "TRUE",
      correctSentenceId: "s9",
      logic:
        'The statement matches the sentence where users evaluate their own lives negatively after exposure to polished images.',
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "Knowing that digital pictures have been edited successfully prevents users from experiencing feelings of inferiority.",
      targetKeywords: [
        "Knowing that digital pictures have been edited",
        "successfully prevents",
        "feelings of inferiority",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "FALSE",
      correctSentenceId: "s10",
      logic:
        'The passage says users still feel inadequate even when they know images are altered, so prevention is false.',
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "Data from the Institute of Cyberpsychology in Vienna reveals an escalating trend of severe self doubt among frequent internet consumers.",
      targetKeywords: [
        "Institute of Cyberpsychology in Vienna",
        "reveals",
        "escalating trend",
        "severe self doubt",
      ],
      isAnchor: true,
      anchorPhrase: "Institute of Cyberpsychology in Vienna",
      correctAnswer: "TRUE",
      correctSentenceId: "s11",
      logic:
        'The sentence reports a sharp increase in imposter syndrome among heavy users, which aligns with severe self doubt.',
    },
    {
      id: "q4",
      label: "Q4",
      order: 4,
      questionStatement:
        "The majority of individuals find it incredibly difficult to follow the browsing limits recommended by clinical therapists.",
      targetKeywords: [
        "majority of individuals",
        "incredibly difficult",
        "follow the browsing limits",
        "recommended by clinical therapists",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "NOT GIVEN",
      correctSentenceId: "s14",
      logic:
        "The passage mentions therapist recommendations but gives no evidence about user compliance difficulty.",
    },
  ],
  [
    {
      tag: "Anchor Missed",
      trigger: "User searches for keywords in Q1, Q2, or Q4 instead of locating the anchor first.",
      feedback:
        "You are searching blindly! Identify the specific research institution's name in Question 3 to unlock the passage and find your starting point.",
    },
    {
      tag: "Sequence Break",
      trigger: "User picks a sentence out of order.",
      feedback:
        "IELTS questions follow the text flow. If you found the answer for Question 3, Question 4 must be located below it!",
    },
    {
      tag: "Logical Fallacy",
      trigger:
        "User identifies the right location for Question 2 but answers True.",
      feedback:
        "You found the correct location, but you ignored the final outcome in the sentence. The text says the feeling 'persists', which means it is not prevented! This makes the statement False.",
    },
    {
      tag: "Not Given Blindness",
      trigger:
        "User marks Q4 as True because they see the words 'clinical therapists' and 'browsing time'.",
      feedback:
        "The text mentions the therapists' advice, but does it say anything about users finding it difficult to obey? Since the information about the users' struggle is completely missing, this claim is Not Given.",
    },
  ],
);

export const L1_FINAL_3 = buildContent(
  "Beyond the Pixel: Long Term Strategies for Digital Health",
  [
    [
      "Over the past decade, society has increasingly recognized that temporary digital detoxes offer little lasting value.",
      "While deleting applications for a weekend provides a momentary sense of relief, true recovery from hyper connectivity requires systemic changes to daily routines and environments.",
    ],
    [
      "The human brain naturally adapts to whatever stimuli it encounters most frequently.",
      "When a person spends countless hours swiping through brief videos, their attention span naturally shortens to match the pace of the medium.",
      "Reversing this neurological adaptation is a slow and deliberate process that goes far beyond simple willpower.",
    ],
    [
      "A common misconception is that short vacations from technology will permanently eliminate compulsive internet usage.",
      "In reality, returning to an unstructured digital environment immediately revives old routines.",
      "Detailed findings from the 2025 Neuroplasticity and Behavior Study illustrated that reconfiguring these biological pathways demands a minimum of six months of continuous behavioral adjustment.",
    ],
    [
      "Implementing these adjustments involves finding high value offline substitutes that engage the body as well as the mind.",
      "Furthermore, substituting virtual engagement with cardiovascular exercise actively stimulates the growth of new neural matter.",
      "Educational institutions are increasingly adopting mindfulness curriculums to combat attention deficits, although researchers are still waiting to evaluate how these programs influence daily application usage at home.",
    ],
    [
      "The ultimate objective is not the complete abandonment of modern technology.",
      "Instead, individuals must strive for digital equilibrium, where electronic tools serve specific functional purposes rather than acting as a default escape from physical reality.",
    ],
  ],
  [
    {
      id: "q1",
      label: "Q1",
      order: 1,
      questionStatement:
        "Brief periods of time spent away from electronic devices are proven to permanently eradicate habitual scrolling.",
      targetKeywords: [
        "Brief periods of time",
        "spent away from electronic devices",
        "proven to permanently eradicate",
        "habitual scrolling",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "FALSE",
      correctSentenceId: "s6",
      logic:
        'The passage labels this idea as a "common misconception," so permanent eradication is false.',
    },
    {
      id: "q2",
      label: "Q2",
      order: 2,
      questionStatement:
        "The 2025 Neuroplasticity and Behavior Study revealed that altering ingrained brain routes takes at least half a year of sustained effort.",
      targetKeywords: [
        "2025 Neuroplasticity and Behavior Study",
        "altering ingrained brain routes",
        "at least half a year",
        "sustained effort",
      ],
      isAnchor: true,
      anchorPhrase: "2025 Neuroplasticity and Behavior Study",
      correctAnswer: "TRUE",
      correctSentenceId: "s8",
      logic:
        'The statement aligns with the sentence that says reconfiguration needs a minimum of six months of continuous adjustment.',
    },
    {
      id: "q3",
      label: "Q3",
      order: 3,
      questionStatement:
        "Replacing smartphone habits with aerobic workouts promotes the physical expansion of brain tissue.",
      targetKeywords: [
        "Replacing smartphone habits",
        "aerobic workouts",
        "physical expansion of brain tissue",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "TRUE",
      correctSentenceId: "s10",
      logic:
        'The sentence says cardiovascular exercise stimulates growth of new neural matter, matching the statement.',
    },
    {
      id: "q4",
      label: "Q4",
      order: 4,
      questionStatement:
        "Teenagers who participate in school sponsored meditation sessions immediately delete their social networking profiles.",
      targetKeywords: [
        "Teenagers",
        "school sponsored meditation sessions",
        "immediately delete",
        "social networking profiles",
      ],
      isAnchor: false,
      anchorPhrase: null,
      correctAnswer: "NOT GIVEN",
      correctSentenceId: "s11",
      logic:
        "Schools adopt mindfulness curriculums, but the passage does not say teenagers delete profiles.",
    },
  ],
  [
    {
      tag: "Anchor Missed",
      trigger: "User searches for keywords in Q1, Q3, or Q4 instead of locating the anchor first.",
      feedback:
        "You are searching blindly! Identify the specific scientific study's title in Question 2 to unlock the passage and find your starting point.",
    },
    {
      tag: "Sequence Break",
      trigger: "User picks a sentence out of order.",
      feedback:
        "IELTS questions follow the text flow. If you found the Anchor in paragraph 3, the answers for Questions 3 and 4 must be located below it!",
    },
    {
      tag: "Logical Fallacy",
      trigger: "User identifies the right location for Question 1 but answers True.",
      feedback:
        "You found the correct location, but you missed the author's tone! The text calls this idea a 'misconception', meaning the statement is actually False.",
    },
    {
      tag: "Not Given Blindness",
      trigger:
        "User marks Q4 as True or False based on the mention of meditation programs.",
      feedback:
        "The text discusses schools introducing mindfulness, but does it ever state that the students delete their profiles as a result? Since the outcome is unknown, this claim is Not Given.",
    },
  ],
);

export const L1_PRACTICE_TESTS_BULK_PAYLOAD = {
  practiceTests: [
    { title: "L1 — Practice 1: The Dopamine Loop", gamlishTfng: L1_PRACTICE_1 },
    { title: "L1 — Practice 2: The Cost of Connection", gamlishTfng: L1_PRACTICE_2 },
    { title: "L1 — Practice 3: Architecture of Boredom", gamlishTfng: L1_PRACTICE_3 },
  ],
};

export const L1_FINAL_TESTS_BULK_PAYLOAD = {
  finalTests: [
    { title: "L1 — Final 1: The Academic Deficit", gamlishTfng: L1_FINAL_1 },
    { title: "L1 — Final 2: The Illusion of Validation", gamlishTfng: L1_FINAL_2 },
    { title: "L1 — Final 3: Beyond the Pixel", gamlishTfng: L1_FINAL_3 },
  ],
};
