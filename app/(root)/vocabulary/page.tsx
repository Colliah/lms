import { Suspense } from "react";
import {
  fetchDailyVocabularyAction,
  getVocabularyStatsAction,
} from "@/actions/vocabulary";
import { PronunciationPractice } from "@/components/ai/pronunciation-practice";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomStudySession } from "@/components/vocabulary/custom-study-session";
import { ReviewScheduleVisualization } from "@/components/vocabulary/review-schedule-visualization";
import { SavedVocabularyList } from "@/components/vocabulary/saved-vocabulary-list";
import { VocabularyBrowser } from "@/components/vocabulary/vocabulary-browser";
import VocabularyLearning from "@/components/vocabulary/vocabulary-learning";
import { VocabularyStats } from "@/components/vocabulary/vocabulary-stats";

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {["total", "mastered", "due", "accuracy"].map((stat) => (
        <Skeleton key={`stat-${stat}`} className="h-28" />
      ))}
    </div>
  );
}

function FlashcardSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

async function StatsContent() {
  const result = await getVocabularyStatsAction();

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Unable to load statistics
      </div>
    );
  }

  return <VocabularyStats stats={result.data} />;
}

async function FlashcardsContent() {
  const result = await fetchDailyVocabularyAction();

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Failed to load vocabulary: {result.error || "Unknown error"}
        </p>
      </div>
    );
  }

  const { reviews, newWords } = result.data;

  // Transform reviews to flatten the nested word structure
  const reviewWords = reviews.map((review) => ({
    ...review.word,
    isReview: true,
  }));

  const newWordsWithFlag = newWords.map((word) => ({
    ...word,
    isReview: false,
  }));

  const allWords = [...reviewWords, ...newWordsWithFlag];

  if (allWords.length === 0) {
    return (
      <div className="text-center py-12 space-y-2">
        <h2 className="text-2xl font-bold">All caught up!</h2>
        <p className="text-muted-foreground">
          No words due for review right now. Check back later or explore new
          words in the Browse tab!
        </p>
      </div>
    );
  }

  // Get first word for pronunciation practice
  const firstWord = allWords[0];

  return (
    <Tabs defaultValue="flashcards" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
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
  );
}

export default function VocabularyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Vocabulary</h1>
          <p className="text-muted-foreground">
            Learn and review vocabulary with spaced repetition
          </p>
        </div>

        {/* Stats Section */}
        <Suspense fallback={<StatsSkeleton />}>
          <StatsContent />
        </Suspense>

        {/* Main Content Tabs */}
        <Tabs defaultValue="review" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="review">Daily Review</TabsTrigger>
            <TabsTrigger value="custom">Custom Study</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            <Suspense fallback={<FlashcardSkeleton />}>
              <FlashcardsContent />
            </Suspense>
          </TabsContent>

          <TabsContent value="custom">
            <CustomStudySession />
          </TabsContent>

          <TabsContent value="schedule">
            <ReviewScheduleVisualization />
          </TabsContent>

          <TabsContent value="browse">
            <VocabularyBrowser />
          </TabsContent>

          <TabsContent value="saved">
            <SavedVocabularyList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
