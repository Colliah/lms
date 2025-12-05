import fs from "fs";
import path from "path";
import { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { prisma } from "../lib/prisma";

interface ReadingPassageData {
  title: string;
  content: string;
  difficulty: string;
  topics: string[];
  wordCount: number;
  questions: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  }[];
}

const DATA_DIR = path.join(process.cwd(), "prisma/data/reading");

async function main() {
  console.log("Starting reading passage seeding...");

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} reading data files`);

  let totalPassages = 0;
  let totalQuestions = 0;

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");

    let passages: ReadingPassageData[];
    try {
      passages = JSON.parse(content);
    } catch (error) {
      console.error(`Failed to parse ${file}:`, error);
      continue;
    }

    console.log(`\nProcessing: ${file} (${passages.length} passages)`);

    for (const passage of passages) {
      // Validate difficulty level
      const difficulty = passage.difficulty as ProficiencyLevel;
      if (!Object.values(ProficiencyLevel).includes(difficulty)) {
        console.log(
          `  Skipping passage: invalid difficulty "${passage.difficulty}"`,
        );
        continue;
      }

      try {
        // Create passage with questions
        await prisma.readingPassage.create({
          data: {
            title: passage.title,
            content: passage.content,
            difficulty,
            topics: passage.topics || [],
            wordCount: passage.wordCount || passage.content.split(/\s+/).length,
            questions: {
              create: passage.questions.map((q, index) => ({
                question: q.question,
                options: q.options || [],
                answer: q.answer,
                explanation: q.explanation || "",
                orderIndex: index,
              })),
            },
          },
        });

        totalPassages++;
        totalQuestions += passage.questions.length;
      } catch (error) {
        console.error(`  Error creating passage "${passage.title}":`, error);
      }
    }
  }

  console.log("\n==================================================");
  console.log("Seeding complete!");
  console.log(`Passages created: ${totalPassages}`);
  console.log(`Questions created: ${totalQuestions}`);

  await prisma.$disconnect();
}

main().catch(console.error);
