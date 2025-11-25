import { fetchPronunciationExerciseAction } from "@/app/actions/speaking";
import PronunciationPractice from "@/components/speaking/pronunciation-practice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SpeakingPage() {
  const result = await fetchPronunciationExerciseAction();

  if (!result.success || !result.data) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>
              {result.error === "Unauthorized"
                ? "Please Sign In"
                : "No Exercises Available"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {result.error ||
                "No pronunciation exercises available at your level."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <PronunciationPractice exercise={result.data} />
    </div>
  );
}
