import { fetchReadingPassageAction } from "@/app/actions/reading";
import ReadingPassageInterface from "@/components/reading/reading-passage-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReadingPage() {
  const result = await fetchReadingPassageAction();

  if (!result.success || !result.data) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>
              {result.error === "Unauthorized"
                ? "Please Sign In"
                : "No Passages Available"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {result.error ||
                "No reading passages available at your level. Please try again later."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ReadingPassageInterface passage={result.data} />
    </div>
  );
}
