/**
 * Grammar Seeding Script
 * Imports generated grammar JSON files into the database
 */

import * as fs from "fs";
import * as path from "path";
import { ExerciseType, ProficiencyLevel } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

interface GrammarQuestion {
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  orderIndex: number;
}

interface GrammarExercise {
  title: string;
  description: string;
  difficulty: string;
  questions: GrammarQuestion[];
}

interface GrammarTopicData {
  topic: {
    name: string;
    description: string;
    difficulty: string;
  };
  exercises: GrammarExercise[];
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

// Map string exercise type to ExerciseType enum
const exerciseTypeMap: Record<string, ExerciseType> = {
  MULTIPLE_CHOICE: ExerciseType.MULTIPLE_CHOICE,
  FILL_IN_BLANK: ExerciseType.FILL_IN_BLANK,
  SENTENCE_CORRECTION: ExerciseType.SENTENCE_CORRECTION,
  MATCH_PATTERN: ExerciseType.MATCH_PATTERN,
};

async function seedGrammar() {
  console.log("Starting grammar seeding...");

  const grammarDir = path.join(process.cwd(), "prisma", "data", "grammar");

  // Check if directory exists
  if (!fs.existsSync(grammarDir)) {
    console.error("Grammar data directory not found:", grammarDir);
    console.log("Run 'bun run scripts/generate-grammar.ts' first.");
    process.exit(1);
  }

  const files = fs.readdirSync(grammarDir).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.error("No grammar JSON files found in:", grammarDir);
    console.log("Run 'bun run scripts/generate-grammar.ts' first.");
    process.exit(1);
  }

  console.log(`Found ${files.length} grammar topic files`);

  let totalTopics = 0;
  let totalExercises = 0;
  let totalQuestions = 0;
  let skippedTopics = 0;

  for (const file of files) {
    const filepath = path.join(grammarDir, file);
    console.log(`\nProcessing: ${file}`);

    try {
      const data = JSON.parse(
        fs.readFileSync(filepath, "utf-8"),
      ) as GrammarTopicData;

      // Validate difficulty
      const topicDifficulty = levelMap[data.topic.difficulty];
      if (!topicDifficulty) {
        console.log(
          `  Skipping: invalid topic difficulty "${data.topic.difficulty}"`,
        );
        skippedTopics++;
        continue;
      }

      // Check if topic already exists
      const existingTopic = await prisma.grammarTopic.findUnique({
        where: { name: data.topic.name },
      });

      let topicId: string;

      if (existingTopic) {
        console.log(`  Topic exists: ${data.topic.name} - updating exercises`);
        topicId = existingTopic.id;

        // Delete existing exercises for this topic (cascade will delete questions)
        await prisma.grammarExercise.deleteMany({
          where: { topicId },
        });
      } else {
        // Create new topic
        const newTopic = await prisma.grammarTopic.create({
          data: {
            name: data.topic.name,
            description: data.topic.description,
            difficulty: topicDifficulty,
          },
        });
        topicId = newTopic.id;
        totalTopics++;
        console.log(`  Created topic: ${data.topic.name}`);
      }

      // Create exercises and questions
      for (const exercise of data.exercises) {
        const exerciseDifficulty = levelMap[exercise.difficulty];
        if (!exerciseDifficulty) {
          console.log(
            `    Skipping exercise: invalid difficulty "${exercise.difficulty}"`,
          );
          continue;
        }

        const createdExercise = await prisma.grammarExercise.create({
          data: {
            topicId,
            title: exercise.title,
            description: exercise.description || null,
            difficulty: exerciseDifficulty,
          },
        });
        totalExercises++;

        // Create questions for this exercise
        for (const question of exercise.questions) {
          const questionType = exerciseTypeMap[question.type];
          if (!questionType) {
            console.log(
              `      Skipping question: invalid type "${question.type}"`,
            );
            continue;
          }

          await prisma.grammarQuestion.create({
            data: {
              exerciseId: createdExercise.id,
              type: questionType,
              question: question.question,
              options: question.options,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation,
              orderIndex: question.orderIndex,
            },
          });
          totalQuestions++;
        }
      }

      console.log(`  Seeded ${data.exercises.length} exercises`);
    } catch (error) {
      console.error(`  Error processing ${file}:`, error);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Seeding complete!");
  console.log(`Topics created: ${totalTopics}`);
  console.log(`Topics skipped: ${skippedTopics}`);
  console.log(`Exercises created: ${totalExercises}`);
  console.log(`Questions created: ${totalQuestions}`);
}

seedGrammar()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
