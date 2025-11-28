import { Suspense } from "react";
import { fetchDailyVocabularyAction } from "@/actions/vocabulary";
import { PronunciationPractice } from "@/components/ai/pronunciation-practice";
import { VocabularySkeleton } from "@/components/skeletons/vocabulary-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VocabularyLearning from "@/components/vocabulary/vocabulary-learning";

async function VocabularyContent() {
  const result = await fetchDailyVocabularyAction();

  if (!result.success || !result.data) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 max-w-md">
          <p className="text-destructive">
            Failed to load vocabulary:{" "}
            {result.success ? "No data available" : result.error}
          </p>
        </div>
      </div>
    );
  }

  const { reviews, newWords } = result.data;

  // Transform reviews to flatten the nested word structure and add isReview flag
  const reviewWords = reviews.map((review) => ({
    ...review.word,
    isReview: true,
  }));

  // Add isReview flag to new words
  const newWordsWithFlag = newWords.map((word) => ({
    ...word,
    isReview: false,
  }));

  const allWords = [...reviewWords, ...newWordsWithFlag];

  if (allWords.length === 0) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">All caught up!</h2>
          <p className="text-muted-foreground">
            No words due for review right now. Check back later!
          </p>
        </div>
      </div>
    );
  }

  // Get first word for pronunciation practice
  const firstWord = allWords[0];

  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs defaultValue="flashcards">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards">
          <VocabularyLearning words={allWords} />
        </TabsContent>

        <TabsContent value="pronunciation" className="max-w-2xl mx-auto">
          <PronunciationPractice
            targetWord={firstWord.word}
            phonetic={firstWord.phonetic || undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function VocabularyPage() {
  return (
    <Suspense fallback={<VocabularySkeleton />}>
      <VocabularyContent />
    </Suspense>
  );
}
