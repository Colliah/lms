/**
 * Vocabulary Generation Script using Gemini API
 * Generates comprehensive vocabulary data for the LMS
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

// Types matching Prisma schema
type ProficiencyLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type PartOfSpeech =
  | "NOUN"
  | "VERB"
  | "ADJECTIVE"
  | "ADVERB"
  | "PRONOUN"
  | "PREPOSITION"
  | "CONJUNCTION"
  | "INTERJECTION"
  | "ARTICLE"
  | "PHRASE";

interface VocabularyWord {
  word: string;
  translation: string;
  phonetic: string;
  difficulty: ProficiencyLevel;
  partOfSpeech: PartOfSpeech;
  definition: string;
  category: string;
  example: string;
  exampleTranslation: string;
}

interface CategoryConfig {
  name: string;
  count: number;
  topics: string[];
}

// Category configuration per level
const levelCategories: Record<ProficiencyLevel, CategoryConfig[]> = {
  A1: [
    {
      name: "Greetings",
      count: 20,
      topics: ["hello", "goodbye", "thank you", "please", "sorry"],
    },
    {
      name: "Numbers",
      count: 30,
      topics: ["counting 1-100", "ordinal numbers"],
    },
    { name: "Family", count: 25, topics: ["immediate family", "relatives"] },
    { name: "Body", count: 25, topics: ["body parts", "health basics"] },
    {
      name: "Colors",
      count: 15,
      topics: ["basic colors", "color descriptions"],
    },
    { name: "Time", count: 30, topics: ["days", "months", "time expressions"] },
    { name: "Food", count: 40, topics: ["common foods", "meals", "drinks"] },
    {
      name: "BasicVerbs",
      count: 50,
      topics: [
        "be",
        "have",
        "do",
        "go",
        "make",
        "take",
        "come",
        "see",
        "want",
        "get",
      ],
    },
    {
      name: "BasicAdjectives",
      count: 40,
      topics: ["size", "quality", "feelings", "appearance"],
    },
    { name: "Places", count: 30, topics: ["home", "city", "school", "shop"] },
    { name: "Weather", count: 20, topics: ["weather conditions", "seasons"] },
    { name: "Clothes", count: 25, topics: ["basic clothing items"] },
    { name: "Animals", count: 30, topics: ["common animals", "pets"] },
    { name: "Objects", count: 20, topics: ["everyday objects", "furniture"] },
  ],
  A2: [
    {
      name: "Travel",
      count: 50,
      topics: ["transportation", "hotel", "directions", "tourism"],
    },
    {
      name: "Shopping",
      count: 40,
      topics: ["stores", "prices", "products", "money"],
    },
    {
      name: "Home",
      count: 35,
      topics: ["rooms", "furniture", "appliances", "housework"],
    },
    {
      name: "Health",
      count: 35,
      topics: ["illness", "symptoms", "medicine", "doctor"],
    },
    {
      name: "Hobbies",
      count: 40,
      topics: ["sports", "entertainment", "leisure activities"],
    },
    {
      name: "Work",
      count: 40,
      topics: ["jobs", "workplace basics", "routines"],
    },
    {
      name: "Education",
      count: 35,
      topics: ["school subjects", "classroom", "studying"],
    },
    {
      name: "Communication",
      count: 35,
      topics: ["phone", "internet", "email basics"],
    },
    {
      name: "Nature",
      count: 30,
      topics: ["plants", "environment", "geography basics"],
    },
    { name: "Emotions", count: 30, topics: ["feelings", "moods", "reactions"] },
    {
      name: "ActionVerbs",
      count: 30,
      topics: ["daily activities", "movement", "interaction"],
    },
  ],
  B1: [
    {
      name: "Business",
      count: 60,
      topics: ["office", "meetings", "projects", "negotiation"],
    },
    {
      name: "Technology",
      count: 50,
      topics: ["computers", "software", "gadgets", "internet"],
    },
    {
      name: "Media",
      count: 40,
      topics: ["news", "social media", "entertainment"],
    },
    {
      name: "Environment",
      count: 35,
      topics: ["pollution", "climate", "conservation"],
    },
    {
      name: "Society",
      count: 40,
      topics: ["community", "culture", "traditions"],
    },
    {
      name: "Finance",
      count: 35,
      topics: ["banking", "money management", "economy basics"],
    },
    {
      name: "Law",
      count: 30,
      topics: ["basic legal terms", "rights", "rules"],
    },
    {
      name: "Politics",
      count: 30,
      topics: ["government", "elections", "policies"],
    },
    {
      name: "Relationships",
      count: 30,
      topics: ["friendship", "family dynamics", "social interactions"],
    },
    {
      name: "Abstract",
      count: 50,
      topics: ["concepts", "ideas", "qualities", "states"],
    },
  ],
  B2: [
    {
      name: "Academic",
      count: 70,
      topics: ["research", "analysis", "methodology", "argumentation"],
    },
    {
      name: "Science",
      count: 50,
      topics: ["biology", "chemistry", "physics basics"],
    },
    {
      name: "Economics",
      count: 45,
      topics: ["markets", "trade", "financial systems"],
    },
    {
      name: "Psychology",
      count: 40,
      topics: ["behavior", "cognition", "emotions"],
    },
    {
      name: "Art",
      count: 35,
      topics: ["visual arts", "music", "literature", "performance"],
    },
    {
      name: "Philosophy",
      count: 30,
      topics: ["ethics", "logic", "existence", "knowledge"],
    },
    {
      name: "Medicine",
      count: 40,
      topics: ["medical terms", "treatments", "anatomy"],
    },
    {
      name: "Legal",
      count: 35,
      topics: ["legal procedures", "contracts", "litigation"],
    },
    {
      name: "Journalism",
      count: 30,
      topics: ["reporting", "media analysis", "editorials"],
    },
    {
      name: "Diplomacy",
      count: 25,
      topics: ["international relations", "negotiations"],
    },
  ],
  C1: [
    {
      name: "PhrasalVerbs",
      count: 60,
      topics: ["advanced phrasal verb combinations"],
    },
    {
      name: "Idioms",
      count: 50,
      topics: ["common English idioms", "expressions"],
    },
    { name: "Collocations", count: 40, topics: ["advanced word combinations"] },
    {
      name: "AcademicWriting",
      count: 50,
      topics: ["thesis vocabulary", "research terms"],
    },
    {
      name: "BusinessAdvanced",
      count: 40,
      topics: ["corporate language", "management"],
    },
    {
      name: "LiteraryTerms",
      count: 30,
      topics: ["literary devices", "critique vocabulary"],
    },
    {
      name: "ScientificAdvanced",
      count: 30,
      topics: ["specialized scientific terms"],
    },
  ],
  C2: [
    {
      name: "RareVocabulary",
      count: 50,
      topics: ["uncommon but useful words"],
    },
    {
      name: "NuancedExpressions",
      count: 40,
      topics: ["subtle differences in meaning"],
    },
    { name: "FormalRegister", count: 35, topics: ["highly formal language"] },
    {
      name: "SpecializedTerms",
      count: 40,
      topics: ["domain-specific vocabulary"],
    },
    {
      name: "EtymologyRich",
      count: 35,
      topics: ["words with interesting origins"],
    },
  ],
};

// Initialize Gemini
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

async function generateVocabularyBatch(
  level: ProficiencyLevel,
  category: string,
  topics: string[],
  count: number,
): Promise<VocabularyWord[]> {
  const prompt = `Generate exactly ${count} English vocabulary words for ${level} CEFR level learners.

Category: ${category}
Topics to cover: ${topics.join(", ")}

Return a JSON array of objects with these exact fields:
- "word": The English word or phrase
- "translation": Vietnamese translation
- "phonetic": IPA pronunciation (e.g., "/həˈloʊ/")
- "difficulty": "${level}"
- "partOfSpeech": One of: NOUN, VERB, ADJECTIVE, ADVERB, PRONOUN, PREPOSITION, CONJUNCTION, INTERJECTION, ARTICLE, PHRASE
- "definition": Clear English definition (appropriate for ${level} learner)
- "category": "${category}"
- "example": Example sentence using the word
- "exampleTranslation": Vietnamese translation of the example

Requirements:
1. Words should be common and useful for ${level} level
2. Vietnamese translations must be accurate and natural
3. IPA phonetics must be correct
4. Example sentences should be simple and practical
5. No duplicate words
6. Mix of word types where appropriate

Return ONLY the JSON array, no other text.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const words = JSON.parse(response.text || "[]") as VocabularyWord[];
    console.log(`Generated ${words.length} words for ${level} - ${category}`);
    return words;
  } catch (error) {
    console.error(`Error generating ${level} - ${category}:`, error);
    return [];
  }
}

async function generateLevelVocabulary(
  level: ProficiencyLevel,
): Promise<VocabularyWord[]> {
  const categories = levelCategories[level];
  const allWords: VocabularyWord[] = [];

  for (const category of categories) {
    console.log(
      `Generating ${level} - ${category.name} (${category.count} words)...`,
    );

    // Generate in smaller batches to avoid API limits
    const batchSize = 25;
    for (let i = 0; i < category.count; i += batchSize) {
      const remaining = Math.min(batchSize, category.count - i);
      const words = await generateVocabularyBatch(
        level,
        category.name,
        category.topics,
        remaining,
      );
      allWords.push(...words);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return allWords;
}

async function saveVocabulary(
  level: ProficiencyLevel,
  words: VocabularyWord[],
) {
  const outputDir = path.join(process.cwd(), "prisma", "data", "vocabulary");
  const filename = `${level.toLowerCase()}-vocabulary.json`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(words, null, 2));
  console.log(`Saved ${words.length} words to ${filepath}`);
}

async function main() {
  const args = process.argv.slice(2);
  const targetLevel = args[0]?.toUpperCase() as ProficiencyLevel | undefined;

  if (
    targetLevel &&
    !["A1", "A2", "B1", "B2", "C1", "C2"].includes(targetLevel)
  ) {
    console.error("Invalid level. Use: A1, A2, B1, B2, C1, or C2");
    process.exit(1);
  }

  const levels: ProficiencyLevel[] = targetLevel
    ? [targetLevel]
    : ["A1", "A2", "B1", "B2", "C1", "C2"];

  console.log(`Generating vocabulary for levels: ${levels.join(", ")}`);
  console.log("This may take several minutes...\n");

  for (const level of levels) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`Starting ${level} vocabulary generation`);
    console.log(`${"=".repeat(50)}\n`);

    const words = await generateLevelVocabulary(level);
    await saveVocabulary(level, words);

    console.log(`\nCompleted ${level}: ${words.length} words generated\n`);
  }

  console.log("\nVocabulary generation complete!");
}

main().catch(console.error);
