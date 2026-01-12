import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { ReviewSession } from "@/components/vocab-review/review-session";
import { getCategoryById } from "@/services/vocab-category";
import { getDueCards, getAllCards } from "@/services/vocab-card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewPageProps {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export async function generateMetadata({ params }: ReviewPageProps) {
  const { categoryId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { title: "Review | LMS" };
  }

  try {
    const category = await getCategoryById({
      userId: session.user.id,
      categoryId,
    });
    return { title: `Review ${category.name} | Vocabulary | LMS` };
  } catch {
    return { title: "Review | LMS" };
  }
}

async function ReviewContent({
  categoryId,
  isPracticeMode,
}: {
  categoryId: string;
  isPracticeMode: boolean;
}) {
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

  const cards = isPracticeMode
    ? await getAllCards({ categoryId })
    : await getDueCards({ userId: session.user.id, categoryId });

  return (
    <ReviewSession
      category={{ id: category.id, name: category.name }}
      cards={cards}
      isPracticeMode={isPracticeMode}
      basePath="/vocabulary/categories"
    />
  );
}

function ReviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-2 w-full" />
      <div className="flex justify-center">
        <Skeleton className="h-[350px] w-full max-w-lg rounded-lg" />
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  );
}

export default async function ReviewPage({
  params,
  searchParams,
}: ReviewPageProps) {
  const { categoryId } = await params;
  const { mode } = await searchParams;
  const isPracticeMode = mode === "practice";

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Suspense fallback={<ReviewSkeleton />}>
        <ReviewContent
          categoryId={categoryId}
          isPracticeMode={isPracticeMode}
        />
      </Suspense>
    </div>
  );
}
