"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategoryForm } from "./category-form";
import { deleteCategoryAction } from "@/actions/vocab-category";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDateString } from "@/lib";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    createdAt: Date;
    cardCount: number;
    masteryStats: {
      NEW: number;
      LEARNING: number;
      REVIEW: number;
      MASTERED: number;
    };
  };
  basePath?: string;
}

export function CategoryCard({
  category,
  basePath = "/vocabulary/categories",
}: CategoryCardProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteCategoryAction(category.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Category deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }

  const totalCards = category.cardCount;
  const masteredPercent =
    totalCards > 0
      ? Math.round((category.masteryStats.MASTERED / totalCards) * 100)
      : 0;

  return (
    <>
      <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: category.color || "#3b82f6" }}
        />

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <Link href={`${basePath}/${category.id}`} className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {category.name}
              </h3>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <CategoryForm
                  mode="edit"
                  category={category}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  }
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatDateString(category.createdAt)}
          </p>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{totalCards} card(s)</span>
            </div>

            {totalCards > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {masteredPercent}% mastered
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width: `${
                        (category.masteryStats.MASTERED / totalCards) * 100
                      }%`,
                    }}
                  />
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{
                      width: `${
                        (category.masteryStats.REVIEW / totalCards) * 100
                      }%`,
                    }}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{
                      width: `${
                        (category.masteryStats.LEARNING / totalCards) * 100
                      }%`,
                    }}
                  />
                  <div
                    className="h-full bg-slate-400 transition-all"
                    style={{
                      width: `${
                        (category.masteryStats.NEW / totalCards) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button asChild size="sm" className="flex-1">
                <Link href={`${basePath}/${category.id}`}>View Cards</Link>
              </Button>
              {totalCards > 0 && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`${basePath}/${category.id}/review`}>Review</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{category.name}" and all{" "}
              {totalCards} cards in it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
