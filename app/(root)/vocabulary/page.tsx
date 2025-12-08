import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SavedVocabularyList } from "@/components/vocabulary/saved-vocabulary-list";
import { VocabularyBrowser } from "@/components/vocabulary/vocabulary-browser";
import { CategoryList } from "@/components/vocab-categories/category-list";
import { getCategories } from "@/services/vocab-category";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

async function MyCategoriesContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Please sign in to view your categories
      </div>
    );
  }

  const categories = await getCategories({ userId: session.user.id });

  return <CategoryList initialCategories={categories} />;
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="my-categories" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="my-categories">My Categories</TabsTrigger>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="my-categories">
            <Suspense fallback={<CategoriesSkeleton />}>
              <MyCategoriesContent />
            </Suspense>
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
