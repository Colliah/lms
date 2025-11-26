import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VocabularySkeleton() {
  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[600px]">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Flashcard */}
          <div className="aspect-3/2 rounded-lg border bg-muted flex items-center justify-center">
            <Skeleton className="h-16 w-48" />
          </div>

          {/* Progress */}
          <Skeleton className="h-2 w-full" />

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
