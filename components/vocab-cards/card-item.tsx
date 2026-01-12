"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { MasteryBadge } from "./mastery-badge";
import { AudioButton } from "./audio-button";
import { CardForm } from "./card-form";
import { deleteCardAction } from "@/actions/vocab-card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { VocabCard } from "@/types/vocab";

interface CardItemProps {
  card: VocabCard;
  categoryId: string;
}

export function CardItem({ card, categoryId }: CardItemProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteCardAction(card.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Card deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete card");
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Word and audio button */}
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-lg truncate">{card.word}</h3>
                <AudioButton
                  text={card.word}
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Part of speech and mastery */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground capitalize">
                  {card.partOfSpeech}
                </span>
                <MasteryBadge
                  level={card.masteryLevel}
                  className="text-xs py-0"
                />
              </div>

              {/* Meaning */}
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {card.meaning}
              </p>

              {/* Example sentence */}
              {card.exampleSentence && (
                <p className="mt-2 text-xs text-muted-foreground italic line-clamp-1">
                  "{card.exampleSentence}"
                </p>
              )}
            </div>

            {/* Image thumbnail */}
            {card.image && (
              <div className="size-32 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                <img
                  src={card.image}
                  alt={card.word}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <CardForm
                  mode="edit"
                  categoryId={categoryId}
                  card={card}
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
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this card?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{card.word}". This action cannot be
              undone.
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
