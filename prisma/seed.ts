import {
  AchievementType,
  ExerciseType,
  PartOfSpeech,
  ProficiencyLevel,
  WritingType,
} from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("Start seeding...");

  // 1. Create Word Categories
  const categories = [
    { name: "Common", description: "Most frequently used words" },
    { name: "Business", description: "Work and office related vocabulary" },
    { name: "Travel", description: "Words for tourism and transportation" },
    { name: "Academic", description: "Scholarly and formal language" },
    { name: "Technology", description: "Computers and internet" },
    { name: "Food & Drink", description: "Meals, ingredients, and cooking" },
  ];

  const categoryMap = new Map();
  for (const cat of categories) {
    const created = await prisma.wordCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.name, created.id);
  }

  // 2. Seed Vocabulary (Sample of 50 words across levels)
  const words = [
    // A1 Common
    {
      word: "hello",
      translation: "xin chào",
      difficulty: ProficiencyLevel.A1,
      partOfSpeech: PartOfSpeech.INTERJECTION,
      definition: "Used as a greeting or to begin a telephone conversation.",
      category: "Common",
    },
    {
      word: "goodbye",
      translation: "tạm biệt",
      difficulty: ProficiencyLevel.A1,
      partOfSpeech: PartOfSpeech.INTERJECTION,
      definition:
        "Used to express good wishes when parting or at the end of a conversation.",
      category: "Common",
    },
    {
      word: "thank you",
      translation: "cảm ơn",
      difficulty: ProficiencyLevel.A1,
      partOfSpeech: PartOfSpeech.PHRASE,
      definition:
        "A polite expression used when acknowledging a gift, service, or compliment.",
      category: "Common",
    },
    {
      word: "water",
      translation: "nước",
      difficulty: ProficiencyLevel.A1,
      partOfSpeech: PartOfSpeech.NOUN,
      definition:
        "A colorless, transparent, odorless liquid that forms the seas, lakes, rivers, and rain.",
      category: "Food & Drink",
    },
    {
      word: "eat",
      translation: "ăn",
      difficulty: ProficiencyLevel.A1,
      partOfSpeech: PartOfSpeech.VERB,
      definition: "Put (food) into the mouth and chew and swallow it.",
      category: "Food & Drink",
    },

    // A2 Travel
    {
      word: "airport",
      translation: "sân bay",
      difficulty: ProficiencyLevel.A2,
      partOfSpeech: PartOfSpeech.NOUN,
      definition:
        "A complex of runways and buildings for the take-off, landing, and maintenance of civil aircraft.",
      category: "Travel",
    },
    {
      word: "ticket",
      translation: "vé",
      difficulty: ProficiencyLevel.A2,
      partOfSpeech: PartOfSpeech.NOUN,
      definition:
        "A piece of paper or card that gives the holder a certain right, especially to enter a place, travel by public transport, or participate in an event.",
      category: "Travel",
    },
    {
      word: "hotel",
      translation: "khách sạn",
      difficulty: ProficiencyLevel.A2,
      partOfSpeech: PartOfSpeech.NOUN,
      definition:
        "An establishment providing accommodations, meals, and other services for travelers and tourists.",
      category: "Travel",
    },

    // B1 Business
    {
      word: "meeting",
      translation: "cuộc họp",
      difficulty: ProficiencyLevel.B1,
      partOfSpeech: PartOfSpeech.NOUN,
      definition:
        "An assembly of people for a particular purpose, especially for formal discussion.",
      category: "Business",
    },
    {
      word: "deadline",
      translation: "hạn chót",
      difficulty: ProficiencyLevel.B1,
      partOfSpeech: PartOfSpeech.NOUN,
      definition:
        "The latest time or date by which something should be completed.",
      category: "Business",
    },
    {
      word: "negotiate",
      translation: "đàm phán",
      difficulty: ProficiencyLevel.B1,
      partOfSpeech: PartOfSpeech.VERB,
      definition: "Obtain or bring about by discussion.",
      category: "Business",
    },

    // B2 Academic
    {
      word: "hypothesis",
      translation: "giả thuyết",
      difficulty: ProficiencyLevel.B2,
      partOfSpeech: PartOfSpeech.NOUN,
      definition:
        "A supposition or proposed explanation made on the basis of limited evidence as a starting point for further investigation.",
      category: "Academic",
    },
    {
      word: "analysis",
      translation: "phân tích",
      difficulty: ProficiencyLevel.B2,
      partOfSpeech: PartOfSpeech.NOUN,
      definition:
        "Detailed examination of the elements or structure of something.",
      category: "Academic",
    },
    {
      word: "significant",
      translation: "đáng kể",
      difficulty: ProficiencyLevel.B2,
      partOfSpeech: PartOfSpeech.ADJECTIVE,
      definition:
        "Sufficiently great or important to be worthy of attention; noteworthy.",
      category: "Academic",
    },
  ];

  for (const w of words) {
    await prisma.word.upsert({
      where: { word: w.word },
      update: {},
      create: {
        word: w.word,
        translation: w.translation,
        difficulty: w.difficulty,
        partOfSpeech: w.partOfSpeech,
        definition: w.definition,
        categories: {
          connect: { id: categoryMap.get(w.category) },
        },
        examples: {
          create: [
            {
              sentence: `This is a sample sentence for ${w.word}.`,
              translation: `Đây là câu ví dụ cho ${w.translation}.`,
              highlight: w.word,
            },
          ],
        },
      },
    });
  }

  // 3. Seed Grammar Topics & Exercises
  const grammarTopics = [
    {
      name: "Present Simple",
      description: "Basic present tense for habits and facts",
      difficulty: ProficiencyLevel.A1,
    },
    {
      name: "Past Simple",
      description: "Actions completed in the past",
      difficulty: ProficiencyLevel.A2,
    },
    {
      name: "Present Perfect",
      description: "Actions connecting past and present",
      difficulty: ProficiencyLevel.B1,
    },
    {
      name: "Conditionals",
      description: "If clauses (Zero, First, Second, Third)",
      difficulty: ProficiencyLevel.B2,
    },
  ];

  for (const topic of grammarTopics) {
    const createdTopic = await prisma.grammarTopic.upsert({
      where: { name: topic.name },
      update: {},
      create: topic,
    });

    // Create an exercise for this topic
    await prisma.grammarExercise.create({
      data: {
        topicId: createdTopic.id,
        title: `${topic.name} Practice`,
        description: `Practice exercises for ${topic.name}`,
        difficulty: topic.difficulty,
        questions: {
          create: [
            {
              type: ExerciseType.MULTIPLE_CHOICE,
              question: "Choose the correct form:",
              options: ["Option A", "Option B", "Option C"],
              correctAnswer: "Option A",
              explanation: "Option A is correct because...",
              orderIndex: 0,
            },
            {
              type: ExerciseType.FILL_IN_BLANK,
              question: "Fill in the blank: He ___ (to be) happy.",
              options: [],
              correctAnswer: "is",
              explanation: "He is singular, so we use is.",
              orderIndex: 1,
            },
          ],
        },
      },
    });
  }

  // 4. Seed Reading Passages
  const passages = [
    {
      title: "My Daily Routine",
      content:
        "I wake up at 7 AM every day. I brush my teeth and have breakfast. Then I go to work...",
      difficulty: ProficiencyLevel.A1,
      wordCount: 150,
      topics: ["daily life", "routine"],
      questions: [
        {
          question: "What time do I wake up?",
          options: ["6 AM", "7 AM", "8 AM"],
          answer: "7 AM",
          orderIndex: 0,
        },
        {
          question: "What do I do after waking up?",
          options: ["Go to work", "Brush teeth", "Sleep"],
          answer: "Brush teeth",
          orderIndex: 1,
        },
      ],
    },
    {
      title: "The Future of AI",
      content:
        "Artificial Intelligence is rapidly changing the world. From self-driving cars to medical diagnosis...",
      difficulty: ProficiencyLevel.B2,
      wordCount: 300,
      topics: ["technology", "science"],
      questions: [
        {
          question: "What is changing the world?",
          options: ["AI", "Cars", "Doctors"],
          answer: "AI",
          orderIndex: 0,
        },
      ],
    },
  ];

  for (const p of passages) {
    await prisma.readingPassage.create({
      data: {
        title: p.title,
        content: p.content,
        difficulty: p.difficulty,
        wordCount: p.wordCount,
        topics: p.topics,
        questions: {
          create: p.questions.map((q) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
            orderIndex: q.orderIndex,
          })),
        },
      },
    });
  }

  // 5. Seed Writing Prompts
  const prompts = [
    {
      title: "Introduce Yourself",
      prompt:
        "Write a short paragraph introducing yourself. Include your name, age, hobbies, and job.",
      type: WritingType.PARAGRAPH,
      difficulty: ProficiencyLevel.A1,
    },
    {
      title: "Opinion Essay",
      prompt:
        "Do you think technology brings people closer or drives them apart? Write an essay supporting your opinion.",
      type: WritingType.ARGUMENTATIVE,
      difficulty: ProficiencyLevel.B2,
    },
  ];

  for (const p of prompts) {
    await prisma.writingPrompt.create({
      data: p,
    });
  }

  // 6. Seed Achievements
  const achievements = [
    {
      name: "First Steps",
      description: "Complete your first lesson",
      type: AchievementType.GENERAL,
      requirement: 1,
    },
    {
      name: "Vocabulary Master",
      description: "Master 50 words",
      type: AchievementType.VOCABULARY,
      requirement: 50,
    },
    {
      name: "Week Streak",
      description: "Study for 7 days in a row",
      type: AchievementType.STREAK,
      requirement: 7,
    },
    {
      name: "Grammar Guru",
      description: "Score 100% on 10 grammar exercises",
      type: AchievementType.GRAMMAR,
      requirement: 10,
    },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { name: a.name },
      update: {},
      create: a,
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
