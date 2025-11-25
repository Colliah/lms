import { fetchWritingPromptAction } from "@/app/actions/writing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WritingEditor from "@/components/writing/writing-editor";

export default async function WritingPage() {
  const result = await fetchWritingPromptAction();

  if (!result.success || !result.data) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>
              {result.error === "Unauthorized"
                ? "Please Sign In"
                : "No Prompts Available"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {result.error || "No writing prompts available at your level."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <WritingEditor prompt={result.data} />
    </div>
  );
}
