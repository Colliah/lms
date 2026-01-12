/**
 * Vocabulary Seeding Script
 * Imports generated vocabulary JSON files into the database
 */

import * as fs from "fs";
import * as path from "path";
import { PartOfSpeech, ProficiencyLevel } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface VocabularyWord {
  word: string;
  translation: string;
  phonetic: string;
  difficulty: string;
  partOfSpeech: string;
  definition: string;
  category: string;
  example: string;
  exampleTranslation: string;
}

// Map string difficulty to ProficiencyLevel enum
const levelMap: Record<string, ProficiencyLevel> = {
  A1: ProficiencyLevel.A1,
  A2: ProficiencyLevel.A2,
  B1: ProficiencyLevel.B1,
  B2: ProficiencyLevel.B2,
  C1: ProficiencyLevel.C1,
  C2: ProficiencyLevel.C2,
};

// Map string part of speech to PartOfSpeech enum
const posMap: Record<string, PartOfSpeech> = {
  NOUN: PartOfSpeech.NOUN,
  VERB: PartOfSpeech.VERB,
  ADJECTIVE: PartOfSpeech.ADJECTIVE,
  ADVERB: PartOfSpeech.ADVERB,
  PRONOUN: PartOfSpeech.PRONOUN,
  PREPOSITION: PartOfSpeech.PREPOSITION,
  CONJUNCTION: PartOfSpeech.CONJUNCTION,
  INTERJECTION: PartOfSpeech.INTERJECTION,
  ARTICLE: PartOfSpeech.ARTICLE,
  PHRASE: PartOfSpeech.PHRASE,
};

async function seedVocabulary() {
  console.log("Starting vocabulary seeding...");

  const vocabDir = path.join(process.cwd(), "prisma", "data", "vocabulary");
  const files = fs.readdirSync(vocabDir).filter((f) => f.endsWith(".json"));

  console.log(`Found ${files.length} vocabulary files`);

  // Create or get categories
  const categoryNames = new Set<string>();
  const allWords: VocabularyWord[] = [];

  // Load all words and collect categories
  for (const file of files) {
    const filepath = path.join(vocabDir, file);
    const words = JSON.parse(
      fs.readFileSync(filepath, "utf-8"),
    ) as VocabularyWord[];
    allWords.push(...words);
    words.forEach((w) => {
      categoryNames.add(w.category);
    });
  }

  console.log(`Total words to seed: ${allWords.length}`);
  console.log(`Categories found: ${Array.from(categoryNames).join(", ")}`);

  // Ensure categories exist
  const categoryMap = new Map<string, string>();
  for (const catName of categoryNames) {
    const category = await prisma.wordCategory.upsert({
      where: { name: catName },
      update: {},
      create: {
        name: catName,
        description: `Words in the ${catName} category`,
      },
    });
    categoryMap.set(catName, category.id);
  }

  console.log(`Created/verified ${categoryMap.size} categories`);

  // Seed words in batches
  let created = 0;
  let skipped = 0;
  const batchSize = 50;

  for (let i = 0; i < allWords.length; i += batchSize) {
    const batch = allWords.slice(i, i + batchSize);

    for (const w of batch) {
      try {
        // Skip if word already exists
        const existing = await prisma.word.findUnique({
          where: { word: w.word.toLowerCase() },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Validate enums
        const difficulty = levelMap[w.difficulty];
        const partOfSpeech = posMap[w.partOfSpeech];

        if (!difficulty || !partOfSpeech) {
          console.log(
            `Skipping ${w.word}: invalid difficulty or part of speech`,
          );
          skipped++;
          continue;
        }

        await prisma.word.create({
          data: {
            word: w.word.toLowerCase(),
            translation: w.translation,
            phonetic: w.phonetic || null,
            difficulty,
            partOfSpeech,
            definition: w.definition,
            categories: {
              connect: { id: categoryMap.get(w.category) },
            },
            examples: w.example
              ? {
                  create: [
                    {
                      sentence: w.example,
                      translation: w.exampleTranslation || "",
                      highlight: w.word,
                    },
                  ],
                }
              : undefined,
          },
        });
        created++;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint")
        ) {
          skipped++;
        } else {
          console.error(`Error seeding "${w.word}":`, error);
        }
      }
    }

    console.log(
      `Progress: ${Math.min(i + batchSize, allWords.length)}/${allWords.length} words processed`,
    );
  }

  console.log(`\nSeeding complete!`);
  console.log(`Created: ${created} words`);
  console.log(`Skipped (duplicates): ${skipped} words`);
}

seedVocabulary()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
