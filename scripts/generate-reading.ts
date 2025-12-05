import fs from "fs";
import path from "path";
import { GeminiService } from "../lib/gemini";
import { ProficiencyLevel } from "@/app/generated/prisma/enums";

// Define the structure for Reading Passage generation
interface ReadingPassageData {
  title: string;
  content: string;
  difficulty: ProficiencyLevel;
  topics: string[];
  wordCount: number;
  questions: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  }[];
}

interface ReadingConfig {
  level: ProficiencyLevel;
  count: number;
  wordRange: [number, number];
  topics: string[];
}

const readingConfigs: ReadingConfig[] = [
  {
    level: "A1",
    count: 10,
    wordRange: [100, 150],
    topics: [
      "Daily Routine",
      "My Family",
      "My House",
      "Hobbies",
      "Food and Drink",
      "My Hometown",
      "Seasons and Weather",
      "Jobs",
      "My Best Friend",
      "Holidays",
    ],
  },
  {
    level: "A2",
    count: 10,
    wordRange: [150, 250],
    topics: [
      "Travel Experiences",
      "Shopping",
      "Health and Fitness",
      "Education",
      "Entertainment",
      "Transport",
      "Technology in Daily Life",
      "Celebrations",
      "Eating Out",
      "Nature",
    ],
  },
  {
    level: "B1",
    count: 10,
    wordRange: [250, 350],
    topics: [
      "Social Media",
      "Environmental Issues",
      "Cultural Differences",
      "Work-Life Balance",
      "Future Career",
      "Traditional Festivals",
      "Learning Languages",
      "Sports Events",
      "Music Genres",
      "Film Reviews",
    ],
  },
  {
    level: "B2",
    count: 10,
    wordRange: [350, 500],
    topics: [
      "Artificial Intelligence",
      "Globalization",
      "Mental Health",
      "Remote Work",
      "Sustainable Living",
      "Space Exploration",
      "Educational Systems",
      "History of Art",
      "Psychology of Advertising",
      "Climate Change Solutions",
    ],
  },
  {
    level: "C1",
    count: 7,
    wordRange: [500, 700],
    topics: [
      "Economic Theories",
      "Philosophy of Ethics",
      "Political Science",
      "Neuroscience",
      "Modern Architecture",
      "Literary Analysis",
      "Sociological Trends",
      "Anthropology",
    ],
  },
  {
    level: "C2",
    count: 5,
    wordRange: [700, 900],
    topics: [
      "Abstract Philosophy",
      "Quantum Physics Basics",
      "Legal Jurisprudence",
      "Linguistic Evolution",
      "Advanced Biotechnology",
    ],
  },
];

const OUTPUT_DIR = path.join(process.cwd(), "prisma/data/reading");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generatePassagesForLevel(config: ReadingConfig) {
  console.log(
    `\nGenerating ${config.count} passages for level ${config.level}...`,
  );

  const prompt = `
    Generate ${config.count} reading comprehension passages for English learners at CEFR level ${config.level}.
    
    Each passage should:
    1. Be suitable for ${config.level} level in terms of vocabulary and grammar.
    2. Have a word count between ${config.wordRange[0]} and ${config.wordRange[1]} words.
    3. Cover diverse topics such as: ${config.topics.join(", ")}.
    4. Include 4-5 multiple-choice comprehension questions for each passage.
    
    Return a strictly valid JSON array where each object has this structure:
    {
      "title": "Passage Title",
      "content": "Full text of the passage...",
      "difficulty": "${config.level}",
      "topics": ["Topic 1", "Topic 2"],
      "wordCount": 123,
      "questions": [
        {
          "question": "The question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Option B", // Must match one of the options exactly
          "explanation": "Why this answer is correct."
        }
      ]
    }
  `;

  try {
    const result =
      await GeminiService.generateJSON<ReadingPassageData[]>(prompt);

    if (result && Array.isArray(result)) {
      const fileName = `${config.level.toLowerCase()}.json`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
      console.log(`Saved ${result.length} passages to ${fileName}`);
    } else {
      console.error(`Failed to generate valid JSON for level ${config.level}`);
    }
  } catch (error) {
    console.error(`Error generating level ${config.level}:`, error);
  }
}

async function main() {
  const targetLevel = process.argv[2]?.toUpperCase();

  if (targetLevel) {
    const config = readingConfigs.find((c) => c.level === targetLevel);
    if (!config) {
      console.error(`Config not found for level ${targetLevel}`);
      process.exit(1);
    }
    await generatePassagesForLevel(config);
  } else {
    // Generate all levels sequentially
    for (const config of readingConfigs) {
      await generatePassagesForLevel(config);
      // Add delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

main().catch(console.error);
