/**
 * Grammar Checking Service using LanguageTool Free API
 * Free tier: 20 requests/minute
 */

export interface GrammarError {
  message: string;
  offset: number;
  length: number;
  replacements: { value: string }[];
  rule?: {
    id: string;
    description: string;
    category: {
      id: string;
      name: string;
    };
  };
  context?: {
    text: string;
    offset: number;
    length: number;
  };
}

export const GrammarService = {
  /**
   * Check text for grammar errors
   */
  async check(text: string, language = "en-US"): Promise<GrammarError[]> {
    try {
      const params = new URLSearchParams();
      params.append("text", text);
      params.append("language", language);

      const response = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`Grammar check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.matches as GrammarError[];
    } catch (error) {
      console.error("Grammar check error:", error);
      return [];
    }
  },

  /**
   * Apply a suggestion to text
   */
  applySuggestion(
    text: string,
    error: GrammarError,
    replacementIndex = 0,
  ): string {
    if (!error.replacements || error.replacements.length === 0) {
      return text;
    }

    const replacement = error.replacements[replacementIndex].value;
    const before = text.substring(0, error.offset);
    const after = text.substring(error.offset + error.length);

    return before + replacement + after;
  },
};
