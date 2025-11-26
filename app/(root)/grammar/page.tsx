import { fetchGrammarExercisesAction } from "@/actions/grammar";
import GrammarExerciseInterface from "@/components/grammar/grammar-exercise-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GrammarPage({
  searchParams,
}: {
  searchParams: { topicId?: string };
}) {
  const topicId = searchParams.topicId;

  if (!topicId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Grammar Practice
            </h1>
            <p className="text-muted-foreground">
              Select a grammar topic to practice
            </p>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Available Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Please select a topic from the sidebar (feature coming soon), or
                use the URL parameter.
              </p>
              <p className="text-sm text-muted-foreground">
                Example: /grammar?topicId=YOUR_TOPIC_ID
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
