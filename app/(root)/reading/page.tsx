import { Suspense } from "react";
import { fetchAllPassagesAction } from "@/actions/reading";
import { ReadingPassageBrowser } from "@/components/reading/reading-passage-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function BrowserSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {["all", "a1", "a2", "b1", "b2", "c1", "c2"].map((level) => (
          <Skeleton key={`filter-${level}`} className="h-9 w-16" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["p1", "p2", "p3", "p4", "p5", "p6"].map((id) => (
          <Skeleton key={`card-${id}`} className="h-48" />
        ))}
      </div>
    </div>
  );
}

async function BrowserContent() {
  const result = await fetchAllPassagesAction();

  if (!result.success || !result.data) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Error Loading Passages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {result.error || "Failed to load reading passages."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return <ReadingPassageBrowser passages={result.data} />;
}

export default function ReadingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Reading Practice
          </h1>
          <p className="text-muted-foreground">
            Improve your reading comprehension with passages at your level
          </p>
        </div>

        <Suspense fallback={<BrowserSkeleton />}>
          <BrowserContent />
        </Suspense>
      </div>
    </div>
  );
}
