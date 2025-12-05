import { Suspense } from "react";
import {
  fetchAllTopicsAction,
  fetchGrammarExercisesAction,
} from "@/actions/grammar";
import GrammarExerciseInterface from "@/components/grammar/grammar-exercise-interface";
import { GrammarTopicBrowser } from "@/components/grammar/grammar-topic-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function TopicBrowserSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <Skeleton>
          <Skeleton key={i} className="h-9 w-16" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <Skeleton>
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}

async function TopicBrowserContent() {
  const result = await fetchAllTopicsAction();

  if (!result.success || !result.data) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Error Loading Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {result.error || "Failed to load grammar topics."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return <GrammarTopicBrowser topics={result.data} />;
}

export default async function GrammarPage({
  searchParams,
}: {
  searchParams: Promise<{ topicId?: string }>;
}) {
  const topicId = (await searchParams).topicId;

  // If no topicId, show topic browser
  if (!topicId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Grammar Practice
            </h1>
            <p className="text-muted-foreground">
              Choose a topic to practice grammar exercises
            </p>
          </div>

          <Suspense fallback={<TopicBrowserSkeleton />}>
            <TopicBrowserContent />
          </Suspense>
        </div>
      </div>
    );
  }

  // If topicId provided, show exercises
  const result = await fetchGrammarExercisesAction({ topicId });

  if (!result.success || !result.data || result.data.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>No Exercises Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {result.error || "No exercises available for this topic."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <GrammarExerciseInterface exercises={result.data} />
    </div>
  );
}
