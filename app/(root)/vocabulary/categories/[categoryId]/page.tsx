import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardList } from "@/components/vocab-cards/card-list";
import { getCategoryById } from "@/services/vocab-category";
import { getCards, getCategoryCardStats } from "@/services/vocab-card";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryPageProps {
  params: Promise<{ categoryId: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { categoryId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { title: "Category | LMS" };
  }

  try {
    const category = await getCategoryById({
      userId: session.user.id,
      categoryId,
    });
    return { title: `${category.name} | Vocabulary | LMS` };
  } catch {
    return { title: "Category | LMS" };
  }
}

async function CategoryContent({ categoryId }: { categoryId: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  let category;
  try {
    category = await getCategoryById({
      userId: session.user.id,
      categoryId,
    });
  } catch {
    notFound();
  }

  const [cards, stats] = await Promise.all([
    getCards({ categoryId }),
    getCategoryCardStats(categoryId),
  ]);

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:justify-between">
        <div className="p-2 space-y-1">
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-4">
            <Link href="/vocabulary?tab=my-categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {category.color && (
                <div
                  className="h-4 w-4 rounded-full mt-2"
                  style={{ backgroundColor: category.color }}
                />
              )}
              <h1 className="text-3xl font-bold tracking-tight">
                {category.name}
              </h1>
            </div>
            <div className="flex gap-2">
              {stats.dueForReview > 0 && (
                <Button asChild className="w-full md:w-auto">
                  <Link href={`/vocabulary/categories/${categoryId}/review`}>
                    <PlayCircle className="mr-2 h-4 w-4" /> Start Review (
                    {stats.dueForReview})
                  </Link>
                </Button>
              )}
              {stats.total > 0 && (
                <Button asChild variant="outline" className="w-full md:w-auto">
                  <Link
                    href={`/vocabulary/categories/${categoryId}/review?mode=practice`}
                  >
                    Practice All
                  </Link>
                </Button>
              )}
            </div>
          </div>
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>

      {stats.total > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Learning Progress</span>
              <span className="font-medium">
                {Math.round((stats.byMastery.MASTERED / stats.total) * 100)}%
                mastered
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden flex">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${(stats.byMastery.MASTERED / stats.total) * 100}%`,
                }}
              />
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${(stats.byMastery.REVIEW / stats.total) * 100}%`,
                }}
              />
              <div
                className="h-full bg-amber-500"
                style={{
                  width: `${(stats.byMastery.LEARNING / stats.total) * 100}%`,
                }}
              />
              <div
                className="h-full bg-slate-400"
                style={{
                  width: `${(stats.byMastery.NEW / stats.total) * 100}%`,
                }}
              />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                New: {stats.byMastery.NEW}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Learning: {stats.byMastery.LEARNING}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Review: {stats.byMastery.REVIEW}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Mastered: {stats.byMastery.MASTERED}
              </span>
            </div>
          </div>
        </div>
      )}

      <CardList categoryId={categoryId} initialCards={cards} />
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <Skeleton className="h-20 rounded-lg" />
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;

  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryContent categoryId={categoryId} />
    </Suspense>
  );
}
