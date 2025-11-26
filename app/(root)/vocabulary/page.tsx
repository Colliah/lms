import { Suspense } from "react";
import { fetchDailyVocabularyAction } from "@/actions/vocabulary";
import { VocabularySkeleton } from "@/components/skeletons/vocabulary-skeleton";
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

  return <VocabularyLearning words={allWords} />;
}

export default function VocabularyPage() {
  return (
    <Suspense fallback={<VocabularySkeleton />}>
      <VocabularyContent />
    </Suspense>
  );
}
