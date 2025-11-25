import { fetchDailyVocabularyAction } from "@/app/actions/vocabulary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VocabularyLearning from "@/components/vocabulary/vocabulary-learning";

export default async function VocabularyPage() {
  const result = await fetchDailyVocabularyAction();

  if (!result.success || !result.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Vocabulary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {result.error || "Failed to load vocabulary"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { reviews, newWords } = result.data;
  const allWords = [
    ...reviews.map((r) => ({ ...r.word, isReview: true, progressId: r.id })),
    ...newWords.map((w) => ({ ...w, isReview: false })),
  ];

  if (allWords.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>All Caught Up! 🎉</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You've completed all your reviews for today. Great job! Come back
              tomorrow for more words.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <VocabularyLearning words={allWords} />
    </div>
  );
}
