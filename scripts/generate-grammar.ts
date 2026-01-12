/**
 * Grammar Exercises Generation Script using Gemini API
 * Generates comprehensive grammar exercise data for the LMS
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

// Types matching Prisma schema
type ProficiencyLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type ExerciseType =
  | "MULTIPLE_CHOICE"
  | "FILL_IN_BLANK"
  | "SENTENCE_CORRECTION"
  | "MATCH_PATTERN";

interface GrammarQuestion {
  type: ExerciseType;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  orderIndex: number;
}

interface GrammarExercise {
  title: string;
  description: string;
  difficulty: ProficiencyLevel;
  questions: GrammarQuestion[];
}

interface GrammarTopicData {
  topic: {
    name: string;
    description: string;
    difficulty: ProficiencyLevel;
  };
  exercises: GrammarExercise[];
}

interface TopicConfig {
  name: string;
  slug: string;
  description: string;
  levels: ProficiencyLevel[];
  exercisesPerLevel: number;
  questionsPerExercise: number;
  subtopics: string[];
}

// Grammar topic configurations
const grammarTopics: TopicConfig[] = [
  {
    name: "Present Tenses",
    slug: "present-tenses",
    description:
      "Master Present Simple, Present Continuous, and Present Perfect tenses",
    levels: ["A1", "A2", "B1"],
    exercisesPerLevel: 3,
    questionsPerExercise: 6,
    subtopics: [
      "Present Simple: habits and routines",
      "Present Simple: facts and general truths",
      "Present Continuous: actions happening now",
      "Present Perfect: life experiences",
      "Present Perfect: recent actions",
      "Present Simple vs Continuous",
    ],
  },
  {
    name: "Past Tenses",
    slug: "past-tenses",
    description: "Learn Past Simple, Past Continuous, and Past Perfect tenses",
    levels: ["A1", "A2", "B1", "B2"],
    exercisesPerLevel: 2,
    questionsPerExercise: 6,
    subtopics: [
      "Past Simple: completed actions",
      "Past Simple: irregular verbs",
      "Past Continuous: interrupted actions",
      "Past Perfect: actions before past",
      "Past Simple vs Continuous",
      "Past Perfect vs Past Simple",
    ],
  },
  {
    name: "Future Tenses",
    slug: "future-tenses",
    description: "Express future with will, going to, and present continuous",
    levels: ["A2", "B1", "B2"],
    exercisesPerLevel: 3,
    questionsPerExercise: 6,
    subtopics: [
      "Will: spontaneous decisions",
      "Will: predictions and promises",
      "Going to: plans and intentions",
      "Present Continuous: fixed arrangements",
      "Will vs Going to",
      "Future Perfect and Continuous",
    ],
  },
  {
    name: "Conditionals",
    slug: "conditionals",
    description: "Master Zero, First, Second, Third, and Mixed Conditionals",
    levels: ["B1", "B2", "C1"],
    exercisesPerLevel: 3,
    questionsPerExercise: 6,
    subtopics: [
      "Zero Conditional: facts and truths",
      "First Conditional: real possibilities",
      "Second Conditional: hypothetical present",
      "Third Conditional: hypothetical past",
      "Mixed Conditionals",
      "Unless and other conditional words",
    ],
  },
  {
    name: "Passive Voice",
    slug: "passive-voice",
    description: "Transform active sentences to passive and vice versa",
    levels: ["B1", "B2", "C1"],
    exercisesPerLevel: 3,
    questionsPerExercise: 6,
    subtopics: [
      "Passive: present tenses",
      "Passive: past tenses",
      "Passive: future and modals",
      "Passive with by agent",
      "Impersonal passive",
      "Active to passive transformation",
    ],
  },
  {
    name: "Reported Speech",
    slug: "reported-speech",
    description: "Report what others said using proper tense changes",
    levels: ["B1", "B2"],
    exercisesPerLevel: 4,
    questionsPerExercise: 6,
    subtopics: [
      "Reporting statements",
      "Reporting questions",
      "Reporting commands and requests",
      "Time and place changes",
      "Reporting verbs",
      "Say vs Tell",
    ],
  },
  {
    name: "Modal Verbs",
    slug: "modal-verbs",
    description:
      "Use modals for ability, permission, obligation, and possibility",
    levels: ["A2", "B1", "B2"],
    exercisesPerLevel: 3,
    questionsPerExercise: 6,
    subtopics: [
      "Can/Could: ability and permission",
      "Must/Have to: obligation",
      "Should/Ought to: advice",
      "May/Might: possibility",
      "Modal perfects: past speculation",
      "Modals in passive voice",
    ],
  },
  {
    name: "Articles",
    slug: "articles",
    description: "Master the use of a, an, the, and zero article",
    levels: ["A1", "A2", "B1", "B2"],
    exercisesPerLevel: 2,
    questionsPerExercise: 6,
    subtopics: [
      "A/An: first mention",
      "The: specific reference",
      "Zero article: generalizations",
      "Articles with geographical names",
      "Articles with uncountable nouns",
      "Fixed expressions with articles",
    ],
  },
  {
    name: "Prepositions",
    slug: "prepositions",
    description: "Use prepositions of time, place, and movement correctly",
    levels: ["A1", "A2", "B1", "B2"],
    exercisesPerLevel: 2,
    questionsPerExercise: 6,
    subtopics: [
      "Prepositions of time: at, on, in",
      "Prepositions of place: at, on, in",
      "Prepositions of movement: to, into, onto",
      "Dependent prepositions with verbs",
      "Dependent prepositions with adjectives",
      "Prepositional phrases",
    ],
  },
  {
    name: "Comparatives and Superlatives",
    slug: "comparatives-superlatives",
    description: "Compare people, places, and things using adjectives",
    levels: ["A2", "B1"],
    exercisesPerLevel: 4,
    questionsPerExercise: 6,
    subtopics: [
      "Comparative adjectives: -er",
      "Comparative adjectives: more",
      "Superlative adjectives: -est",
      "Superlative adjectives: most",
      "Irregular comparisons",
      "As...as comparisons",
    ],
  },
  {
    name: "Relative Clauses",
    slug: "relative-clauses",
    description: "Connect ideas using who, which, that, where, when, and whose",
    levels: ["B1", "B2"],
    exercisesPerLevel: 4,
    questionsPerExercise: 6,
    subtopics: [
      "Defining relative clauses",
      "Non-defining relative clauses",
      "Who, which, that usage",
      "Where, when, whose usage",
      "Omitting relative pronouns",
      "Reduced relative clauses",
    ],
  },
  {
    name: "Gerunds and Infinitives",
    slug: "gerunds-infinitives",
    description: "Choose between -ing forms and to-infinitive correctly",
    levels: ["B1", "B2", "C1"],
    exercisesPerLevel: 3,
    questionsPerExercise: 6,
    subtopics: [
      "Verbs followed by gerund",
      "Verbs followed by infinitive",
      "Verbs with both (different meaning)",
      "Gerund after prepositions",
      "Infinitive of purpose",
      "Perfect and passive forms",
    ],
  },
];

// Initialize Gemini
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

async function generateExercises(
  topic: TopicConfig,
  level: ProficiencyLevel,
  subtopics: string[],
  count: number,
): Promise<GrammarExercise[]> {
  const prompt = `Generate exactly ${count} grammar exercises for ${level} CEFR level learners.

Topic: ${topic.name}
Subtopics to cover: ${subtopics.join(", ")}

Return a JSON array of exercise objects. Each exercise must have:
- "title": Short exercise title (e.g., "Present Simple: Daily Routines")
- "description": Brief description of what students will practice
- "difficulty": "${level}"
- "questions": Array of ${topic.questionsPerExercise} question objects

Each question object must have:
- "type": One of: "MULTIPLE_CHOICE", "FILL_IN_BLANK", "SENTENCE_CORRECTION"
- "question": The question with blank shown as ___ for fill-in-blank
- "options": Array of 4 answer choices
- "correctAnswer": The exact correct answer from options
- "explanation": Clear explanation in English (include Vietnamese hint for difficult concepts)
- "orderIndex": Question number (1 to ${topic.questionsPerExercise})

Requirements:
1. Questions should be appropriate for ${level} level
2. Include variety of question types (mostly FILL_IN_BLANK and MULTIPLE_CHOICE)
3. Explanations should be clear and educational
4. Use practical, everyday sentences
5. Each exercise should focus on one subtopic
6. Options should include plausible distractors

Return ONLY the JSON array, no other text.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const exercises = JSON.parse(response.text || "[]") as GrammarExercise[];
    console.log(
      `  Generated ${exercises.length} exercises for ${topic.name} - ${level}`,
    );
    return exercises;
  } catch (error) {
    console.error(`Error generating ${topic.name} - ${level}:`, error);
    return [];
  }
}

async function generateTopicData(
  topic: TopicConfig,
): Promise<GrammarTopicData> {
  console.log(`\nGenerating: ${topic.name}`);
  console.log(`Levels: ${topic.levels.join(", ")}`);

  const allExercises: GrammarExercise[] = [];

  for (const level of topic.levels) {
    // Select subtopics appropriate for this level
    const levelIndex = topic.levels.indexOf(level);
    const subtopicsPerLevel = Math.ceil(
      topic.subtopics.length / topic.levels.length,
    );
    const startIdx = levelIndex * subtopicsPerLevel;
    const levelSubtopics = topic.subtopics.slice(
      startIdx,
      startIdx + subtopicsPerLevel,
    );

    const exercises = await generateExercises(
      topic,
      level,
      levelSubtopics.length > 0 ? levelSubtopics : topic.subtopics,
      topic.exercisesPerLevel,
    );
    allExercises.push(...exercises);

    // Rate limiting delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  return {
    topic: {
      name: topic.name,
      description: topic.description,
      difficulty: topic.levels[0], // Starting level
    },
    exercises: allExercises,
  };
}

async function saveTopicData(topic: TopicConfig, data: GrammarTopicData) {
  const outputDir = path.join(process.cwd(), "prisma", "data", "grammar");

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `${topic.slug}.json`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`Saved ${data.exercises.length} exercises to ${filepath}`);
}

async function main() {
  const args = process.argv.slice(2);
  const targetTopic = args[0]?.toLowerCase();

  // Filter topics if specific one requested
  const topics = targetTopic
    ? grammarTopics.filter(
        (t) =>
          t.slug === targetTopic || t.name.toLowerCase().includes(targetTopic),
      )
    : grammarTopics;

  if (topics.length === 0) {
    console.error("Topic not found. Available topics:");
    grammarTopics.forEach((t) => {
      console.log(`  - ${t.slug}`);
    });
    process.exit(1);
  }

  console.log("Grammar Exercise Generation");
  console.log("=".repeat(50));
  console.log(`Generating ${topics.length} topic(s)`);
  console.log("This may take several minutes...\n");

  let totalExercises = 0;
  let totalQuestions = 0;

  for (const topic of topics) {
    const data = await generateTopicData(topic);
    await saveTopicData(topic, data);

    totalExercises += data.exercises.length;
    totalQuestions += data.exercises.reduce(
      (sum, ex) => sum + ex.questions.length,
      0,
    );

    console.log(`Completed: ${topic.name}\n`);
  }

  console.log("=".repeat(50));
  console.log("Generation Complete!");
  console.log(`Total Exercises: ${totalExercises}`);
  console.log(`Total Questions: ${totalQuestions}`);
}

main().catch(console.error);
