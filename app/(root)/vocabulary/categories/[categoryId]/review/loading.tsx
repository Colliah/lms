import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewLoading() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
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
