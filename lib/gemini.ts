import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI with API key from environment
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export const GeminiService = {
  /**
   * Generate text content using Gemini
   */
  async generateContent(
    prompt: string,
    model = "gemini-2.5-flash",
  ): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API Key is missing");
      }

      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text || "No response generated.";
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  },

  /**
   * Generate JSON response from Gemini
   */
  async generateJSON<T>(
    prompt: string,
    model = "gemini-2.5-flash",
  ): Promise<T> {
    try {
      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini JSON Error:", error);
      throw error;
    }
  },

  /**
   * Generate image using Gemini
   */
  async generateImage(prompt: string): Promise<string | null> {
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: prompt }],
        },
      });

      // Find inline image data
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType || "image/png"};base64,${
              part.inlineData.data
            }`;
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Image Generation Error:", error);
      return null;
    }
  },

  /**
   * Get word family (noun, verb, adjective, adverb forms)
   */
  async getWordFamily(word: string): Promise<string[]> {
    const prompt = `List the word family (lexical field) for "${word}" (e.g., noun form, verb form, adjective form, adverb form). Return ONLY a JSON array of strings. Example for "act": ["actor (n)", "active (adj)", "action (n)", "enact (v)"]`;

    try {
      const result = await this.generateJSON<string[]>(prompt);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Word family error:", error);
      return [];
    }
  },

  /**
   * Get common collocations for a word
   */
  async getCollocations(word: string): Promise<AIResourceEntry[]> {
    const prompt = `List 5 common collocations for the English word "${word}". 
    Return a JSON array of objects with these keys: "phrase", "meaning" (English), "vietnamese" (Vietnamese translation), "example".
    Example: [{"phrase": "make a bed", "meaning": "to arrange the sheets and covers", "vietnamese": "dọn giường", "example": "I make my bed every morning."}]`;

    try {
      return await this.generateJSON<AIResourceEntry[]>(prompt);
    } catch (error) {
      console.error("Collocations error:", error);
      return [];
    }
  },

  /**
   * Get phrasal verbs containing the word
   */
  async getPhrasalVerbs(word: string): Promise<AIResourceEntry[]> {
    const prompt = `List 5 common phrasal verbs containing the word "${word}". 
    Return a JSON array of objects with these keys: "phrase", "meaning" (English), "vietnamese" (Vietnamese translation), "example".
    Example: [{"phrase": "look after", "meaning": "to take care of someone", "vietnamese": "chăm sóc", "example": "She looks after her grandmother."}]`;

    try {
      return await this.generateJSON<AIResourceEntry[]>(prompt);
    } catch (error) {
      console.error("Phrasal verbs error:", error);
      return [];
    }
  },

  /**
   * Get idioms containing the word
   */
  async getIdioms(word: string): Promise<AIResourceEntry[]> {
    const prompt = `List 3 common idioms containing the word "${word}". 
    Return a JSON array of objects with these keys: "phrase", "meaning" (English), "vietnamese" (Vietnamese translation), "example".
    Example: [{"phrase": "rain cats and dogs", "meaning": "to rain very heavily", "vietnamese": "mưa như trút nước", "example": "It's raining cats and dogs outside."}]`;

    try {
      return await this.generateJSON<AIResourceEntry[]>(prompt);
    } catch (error) {
      console.error("Idioms error:", error);
      return [];
    }
  },

  /**
   * Get Vietnamese definition/translation
   */
  async getVietnameseDefinition(word: string): Promise<string> {
    const prompt = `Provide a short, concise Vietnamese definition/translation for the English word "${word}". If it has multiple common meanings, list the top 2. Do not include the English word in the output, just the Vietnamese.`;

    try {
      return await this.generateContent(prompt);
    } catch (error) {
      console.error("Vietnamese definition error:", error);
      return "";
    }
  },

  /**
   * Evaluate pronunciation accuracy
   */
  async evaluatePronunciation(
    targetWord: string,
    spokenText: string,
  ): Promise<string> {
    const prompt = `I am practicing English pronunciation. I tried to say "${targetWord}". The speech recognition heard "${spokenText}".
    Analyze this. 
    1. If it matches exactly (ignoring case), say "Perfect pronunciation!".
    2. If it is close, point out the specific sound errors (e.g., "th" vs "s", "r" vs "l").
    3. If different, encourage trying again.
    Provide a specific, physical tip on how to position the mouth/tongue for "${targetWord}".
    Keep the response under 60 words, friendly, and formatted in Markdown.`;

    return await this.generateContent(prompt);
  },

  /**
   * Get Word of the Day
   */
  async getWordOfTheDay(): Promise<WordOfDay | null> {
    const prompt = `
  Generate a random, useful English "Word of the Day" for an intermediate learner (Band A, B or C preferred for interesting nuances).

  Return the output as a valid JSON object with these exact fields:
  - "word": The English word.
  - "ipa": The International Phonetic Alphabet pronunciation.
  - "type": Part of speech and always uppercase first letter.
  - "band": Strictly "A", "B", or "C".
  - "definition": English definition, explain simple.
  - "vietnameseDefinition": Vietnamese definition explain simple.
  - "example": Array of exactly 3 items (Strictly follow Rule 3).
  - "synonym": Array of exactly 5 synonyms.
  - "antonym": Array of exactly 5 antonyms.
  - "image_prompt": "A hyper-detailed, realistic image description specifically based on the word. It must vividly depict a scene, action, or object that literally represents the meaning of the word with precise visual elements, lighting, and textures."

  --- CRITICAL SELECTION RULES ---

    1. THE "ANTI-BOREDOM" PROTOCOL (STRICT DIVERSITY)
  You must NOT default to common topics like "Emotions", "Weather", or "Daily Routine" unless specifically necessary.
  Before selecting a word, you must internally simulate rolling a 20-sided die to pick a **Random Domain** from this list:

  1.  **Hard Sciences**: Astrophysics, Quantum Mechanics, Geology, Marine Biology.
  2.  **The Arts**: Renaissance Art, Music Theory, Cinematography, Architecture (Baroque/Gothic).
  3.  **Philosophy & History**: Stoicism, Ancient Rome, Victorian Era, Logic Fallacies.
  4.  **Modern Life**: Corporate Jargon, Cybersecurity, Fintech/Crypto, Social Media Slang (Gen Z).
  5.  **Nature & Environment**: Mycology (Mushrooms), Meteorology, Ornithology (Birds), Botany.
  6.  **Culinary & Lifestyle**: Gastronomy, Oenology (Wine), Textile/Fashion, Interior Design.
  7.  **Niche Hobbies**: Philately, Chess, Spelunking, Pottery.
  8.  **Abstract Concepts**: Time, Memory, Probability, Aesthetics.
  9.  **Emotions (Complex)**: Nostalgia, Melancholy, Serendipity, Epiphany.
  10. **Business & Law**: Litigation, Marketing, Real Estate, Economics.

  2. EXCLUSION LIST (NO DUPLICATES)
  Check the candidate word against this list. If it exists, discard it and pick another immediately.
  **BANNED WORDS:**
  [INSERT_USED_WORDS_HERE]

  3. SELECTION CRITERIA
  - **The Word**: Can be a Noun, Verb, Adjective, or an Idiom.
  - **Complexity**: Aim for words that are "cool to know" or "highly useful" (e.g., instead of "Sad", use "Melancholic" or "Despondent"; instead of "Eat", use "Devour" or "Savor").
  - **Relevance**: Even if the word is academic, the example sentence must be relatable to modern life.

  4. **STRICT DATA STRUCTURE FOR 'EXAMPLE'**:
     - The "example" field MUST be an array of objects, NOT strings.
     - Each object inside the array must have exactly these two keys:
       1. "sentence": The English sentence containing the word.
       2. "translation": The Vietnamese translation of that sentence.
     
  5. **Content Quality**:
     - Avoid overly simple words (like "Happy", "Run", "Eat").
     - Prefer words that express specific nuances or complex ideas suitable for an intermediate/advanced learner.
`;
    try {
      const wordData = await this.generateJSON<WordOfDay>(prompt);

      if (!wordData || !wordData.word) {
        throw new Error("Invalid data format from Gemini");
      }

      const imagePrompt =
        wordData.image_prompt ||
        `illustration of ${wordData.word} minimalist flat design`;

      const randomSeed = Math.floor(Math.random() * 1000);

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        imagePrompt,
      )}?width=800&height=600&nologo=true&seed=${randomSeed}`;

      return {
        ...wordData,
        image: imageUrl,
      };
    } catch (error) {
      console.error("Word of day error:", error);
      return null;
    }
  },
};

export interface AIResourceEntry {
  phrase: string;
  meaning: string;
  vietnamese: string;
  example: string;
}

export interface WordOfDay {
  word: string;
  ipa: string;
  type: string;
  band: string;
  definition: string;
  vietnameseDefinition: string;
  example: {
    sentence: string;
    translation: string;
  }[];
  synonym: string[];
  antonym: string[];
  image_prompt: string;
  image?: string | null;
}
