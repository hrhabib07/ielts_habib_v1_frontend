import type { StageConfig } from "./types";

export const STAGE_CONFIGS: StageConfig[] = [
  {
    stage: 1,
    duration: 90,
    passage:
      "The development of the first underground railway in London, the Metropolitan Railway, began in 1860. It was designed to alleviate the growing congestion on the city's surface streets, which were increasingly blocked by horse-drawn carriages. Unlike modern systems, early trains used steam locomotives, which necessitated the inclusion of numerous ventilation shafts to allow smoke to escape. Despite the initial public skepticism regarding the safety of traveling beneath the earth, the line opened in 1863 and transported over 30,000 passengers on its first day of operation, proving the commercial viability of subterranean transit.",
    questions: [
      {
        id: "s1-q1",
        type: "gap-fill",
        question:
          "The primary purpose of constructing the Metropolitan Railway was to reduce ___________ in London.",
        correctAnswer: "congestion",
      },
      {
        id: "s1-q2",
        type: "gap-fill",
        question:
          "Although the public was ___________ about the safety of the new system, it was an immediate success.",
        correctAnswer: "skeptical",
      },
    ],
  },
  {
    stage: 2,
    duration: 120,
    passage:
      "While bioluminescence is frequently associated with deep-sea organisms, recent studies suggest its presence in terrestrial fungi plays a pivotal role in spore dispersal. By emitting a faint green glow, these fungi attract nocturnal insects that inadvertently carry spores to new locations. This symbiotic relationship is often disrupted by anthropogenic light pollution. Evidence indicates that artificial illumination from nearby infrastructure overwhelms the subtle signals produced by the fungi, leading to a precipitous decline in local fungal populations. Researchers argue that this disruption suggests that the ecological consequences of light pollution are more pervasive than previously understood.",
    questions: [
      {
        id: "s2-q1",
        type: "true-false-ng",
        question:
          "Artificial light sources interfere with the ability of fungi to reproduce effectively.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "TRUE",
      },
      {
        id: "s2-q2",
        type: "true-false-ng",
        question:
          "Deep-sea bioluminescence is more complex than terrestrial bioluminescence.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "NOT GIVEN",
      },
    ],
  },
  {
    stage: 3,
    duration: 90,
    passage:
      "Thomas Carlyle's 'Great Man' theory posits that history is primarily shaped by the impact of highly influential individuals who, due to their charisma or intellect, utilize their power in ways that have decisive historical effects. Conversely, proponents of social determinism contend that such individuals are merely the products of their social environment—the 'ripples' on a tide of inevitable societal shifts. To suggest that a single figure could unilaterally pivot the course of a civilization is, to the social determinist, to ignore the myriad of underlying socioeconomic factors that necessitate the emergence of such a leader at a specific historical juncture.",
    questions: [
      {
        id: "s3-q1",
        type: "mcq",
        question: "Which best summarizes the social determinist perspective?",
        options: [
          "Leaders drive socioeconomic shifts",
          "Leaders emerge due to societal conditions",
          "Social determinists ignore socioeconomic factors",
          "History is random with no direction",
        ],
        correctAnswer: "B",
      },
    ],
  },
];

export const TOTAL_QUESTIONS = STAGE_CONFIGS.reduce(
  (acc, s) => acc + s.questions.length,
  0
);
