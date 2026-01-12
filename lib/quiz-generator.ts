import { GeminiService } from "@/lib/gemini";

export interface QuizQuestion {
  Question: string;
  Option_A?: string;
  Option_B?: string;
  Option_C?: string;
  Option_D?: string;
  Option_E?: string;
  Correct_Answer: string;
  Explanation: string;
  Base_Word?: string; // For fill-in-the-blank
}

export interface TOEICQuestion {
  id: number;
  Question?: string;
  Image_Prompt?: string;
  Audio_Script?: string;
  Placeholder?: string;
  Option_A: string;
  Option_B: string;
  Option_C: string;
  Option_D?: string;
  Correct_Answer: string;
  Explanation: string;
}

export interface TOEICSet {
  Set_ID?: number;
  Topic?: string;
  Transcript?: string;
  Passage_Content?: string;
  Doc_Type?: string;
  Questions?: TOEICQuestion[];
}

export const QuizGeneratorService = {
  /**
   * Generate quiz questions on a specific topic
   */
  async generateExercise(
    topic: string,
    level: "A" | "B" | "C" = "B",
    type: "Multiple Choice" | "Fill-in-the-blank" = "Multiple Choice",
  ): Promise<QuizQuestion[]> {
    const prompt = `
Role: You are an expert English Language Assessment Specialist (CEFR standards).

Task: Generate a strictly formatted JSON Array containing 5 questions on the topic: "${topic}".

Configuration:
- Target Level: ${level} (Strictly adhere to CEFR standards).
- Question Type: ${type}

LOGIC & SCHEMA RULES:

CASE 1: IF Question Type is "Multiple Choice":
- Content: Create a question with 5 options (A, B, C, D, E).
- Distractor Logic: Wrong answers must be plausible mistakes (L1 interference, confusion).
- JSON Object Schema:
  {
    "Question": "Question text...",
    "Option_A": "...",
    "Option_B": "...",
    "Option_C": "...",
    "Option_D": "...",
    "Option_E": "...",
    "Correct_Answer": "A",
    "Explanation": "Explanation in Vietnamese detailing why it is correct and others are wrong."
  }

CASE 2: IF Question Type is "Fill-in-the-blank":
- Content: Create a sentence with a placeholder "______" (6 underscores).
- Hint Logic: Provide a "Base_Word" (root word) for the user to conjugate/transform (Word Form/Tense).
- JSON Object Schema:
  {
    "Question": "Sentence with ______ inside.",
    "Base_Word": "Root word (e.g., 'go', 'happy')",
    "Correct_Answer": "Transformed word (e.g., 'went', 'happily')",
    "Explanation": "Explanation in Vietnamese about the grammar rule used."
  }

OUTPUT REQUIREMENT:
- Return ONLY the raw JSON Array based on the selected Question Type schema.
`;

    try {
      return await GeminiService.generateJSON<QuizQuestion[]>(prompt);
    } catch (error) {
      console.error("Quiz generation error:", error);
      return [];
    }
  },

  /**
   * Generate TOEIC practice questions for a specific part
   */
  async generateTOEICPart(
    part: 1 | 2 | 3 | 4 | 5 | 6 | 7,
    quantity: number,
  ): Promise<TOEICSet[]> {
    let prompt = "";

    switch (part) {
      case 1:
        prompt = `Role: You are an expert TOEIC Exam Creator (Part 1 Specialist).
Task: Generate a strictly formatted JSON Array containing exactly ${quantity} distinct questions for **TOEIC Part 1 (Photographs)**.
Topics: Varied (Office, Street, Household).
Schema: [{"id": 1, "Image_Prompt": "Detailed description of the scene (Use this for AI image generation)", "Option_A": "...", "Option_B": "...", "Option_C": "...", "Option_D": "...", "Correct_Answer": "A", "Explanation": "Vietnamese explanation..."}]`;
        break;
      case 2:
        prompt = `Role: You are an expert TOEIC Exam Creator (Part 2 Specialist).
Task: Generate a strictly formatted JSON Array containing exactly ${quantity} distinct questions for **TOEIC Part 2 (Question-Response)**.
Schema: [{"id": 1, "Audio_Script": "...", "Option_A": "...", "Option_B": "...", "Option_C": "...", "Correct_Answer": "A", "Explanation": "Vietnamese explanation..."}]`;
        break;
      case 3:
        prompt = `Role: You are an expert TOEIC Exam Creator (Part 3 Specialist).
Task: Generate a strictly formatted JSON Array containing exactly ${Math.max(1, Math.floor(quantity / 3))} Conversation Sets (each set has 3 questions) for **TOEIC Part 3**.
Schema: [{"Set_ID": 1, "Transcript": "...", "Questions": [{"id": 1, "Question": "...", "Option_A": "...", "Option_B": "...", "Option_C": "...", "Option_D": "...", "Correct_Answer": "A", "Explanation": "..."}]}]`;
        break;
      case 4:
        prompt = `Role: You are an expert TOEIC Exam Creator (Part 4 Specialist).
Task: Generate a strictly formatted JSON Array containing exactly ${Math.max(1, Math.floor(quantity / 3))} Short Talk Sets (each set has 3 questions) for **TOEIC Part 4**.
Schema: [{"Set_ID": 1, "Transcript": "...", "Questions": [{"id": 1, "Question": "...", "Option_A": "...", "Option_B": "...", "Option_C": "...", "Option_D": "...", "Correct_Answer": "A", "Explanation": "..."}]}]`;
        break;
      case 5:
        prompt = `Role: You are an expert TOEIC Exam Creator (Part 5 Specialist).
Task: Generate a strictly formatted JSON Array containing exactly ${quantity} distinct questions for **TOEIC Part 5**.
Schema: [{"id": 1, "Question": "Sentence with ______", "Option_A": "...", "Option_B": "...", "Option_C": "...", "Option_D": "...", "Correct_Answer": "A", "Explanation": "Vietnamese explanation..."}]`;
        break;
      case 6:
        prompt = `Role: You are an expert TOEIC Exam Creator (Part 6 Specialist).
Task: Generate a strictly formatted JSON Array containing exactly ${Math.max(1, Math.floor(quantity / 4))} Text Sets (each has 4 questions) for **TOEIC Part 6**.
Schema: [{"Set_ID": 1, "Passage_Content": "Text with [1], [2]...", "Questions": [{"id": 1, "Placeholder": "[1]", "Question_Type": "...", "Option_A": "...", "Option_B": "...", "Option_C": "...", "Option_D": "...", "Correct_Answer": "A", "Explanation": "..."}]}]`;
        break;
      case 7:
        prompt = `Role: You are an expert TOEIC Exam Creator (Part 7 Specialist).
Task: Generate a strictly formatted JSON Array containing exactly ${Math.max(1, Math.floor(quantity / 3))} Reading Sets for **TOEIC Part 7**.
Format Mode: Single Passage.
Schema: [{"Set_ID": 1, "Passage_Content": "...", "Questions": [{"id": 1, "Question": "...", "Option_A": "...", "Option_B": "...", "Option_C": "...", "Option_D": "...", "Correct_Answer": "A", "Explanation": "..."}]}]`;
        break;
      default:
        return [];
    }

    try {
      const result = await GeminiService.generateJSON<TOEICSet[]>(prompt);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("TOEIC generation error:", error);
      return [];
    }
  },

  /**
   * Generate theory/study guide content for a grammar topic
   */
  async generateTheoryContent(topic: string): Promise<string> {
    const prompt = `Create a comprehensive study guide for the English Grammar topic: "${topic}". 
    Target Audience: A2-B1 Learners.
    Format: Markdown.
    
    Structure:
    # ${topic}
    ### 1. Definition & Usage
    (Simple explanation)
    
    ### 2. Structure / Formula
    (Use code blocks or bold text for formulas like S + V)
    
    ### 3. Examples
    (List 5 clear examples)
    
    ### 4. Common Mistakes
    (What do students usually get wrong?)
    
    ### 5. Pro Tip 💡
    (A mnemonic or trick)`;

    return await GeminiService.generateContent(prompt);
  },
};
