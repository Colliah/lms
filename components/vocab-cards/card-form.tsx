"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCardAction, updateCardAction } from "@/actions/vocab-card";
import { toast } from "sonner";
import type { VocabCard } from "@/types/vocab";

interface CardFormProps {
  mode: "create" | "edit";
  categoryId: string;
  card?: VocabCard;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const partOfSpeechOptions = [
  { value: "noun", label: "Noun" },
  { value: "verb", label: "Verb" },
  { value: "adjective", label: "Adjective" },
  { value: "adverb", label: "Adverb" },
  { value: "pronoun", label: "Pronoun" },
  { value: "preposition", label: "Preposition" },
  { value: "conjunction", label: "Conjunction" },
  { value: "interjection", label: "Interjection" },
  { value: "phrase", label: "Phrase" },
];

export function CardForm({
  mode,
  categoryId,
  card,
  trigger,
  onSuccess,
}: CardFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [partOfSpeech, setPartOfSpeech] = useState(
    card?.partOfSpeech || "noun"
  );
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.set("partOfSpeech", partOfSpeech);

    try {
      let result;

      if (mode === "create") {
        result = await createCardAction(categoryId, formData);
      } else if (card) {
        result = await updateCardAction(card.id, formData);
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(mode === "create" ? "Card created" : "Card updated");
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add New Card" : "Edit Card"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new vocabulary flashcard to this category."
                : "Update your flashcard details."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2 required">
              <Label htmlFor="word">
                Word <span className="text-red-500">*</span>
              </Label>
              <Input
                id="word"
                name="word"
                placeholder="e.g., ubiquitous"
                defaultValue={card?.word}
                required
                autoComplete="off"
              />
            </div>

            <div className="grid gap-2 required">
              <Label htmlFor="meaning">
                Meaning <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="meaning"
                name="meaning"
                placeholder="The definition or translation..."
                defaultValue={card?.meaning}
                required
                rows={2}
              />
            </div>

            <div className="grid gap-2 required">
              <Label htmlFor="partOfSpeech">
                Part of Speech <span className="text-red-500">*</span>
              </Label>
              <Select value={partOfSpeech} onValueChange={setPartOfSpeech}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select part of speech" />
                </SelectTrigger>
                <SelectContent>
                  {partOfSpeechOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 required">
              <Label htmlFor="exampleSentence">
                Example Sentence <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="exampleSentence"
                name="exampleSentence"
                placeholder="Use the word in a sentence..."
                defaultValue={card?.exampleSentence || ""}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                defaultValue={card?.image || ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Personal Notes</Label>
              <Textarea
                id="note"
                name="note"
                placeholder="Your own notes or memory tips..."
                defaultValue={card?.note || ""}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : mode === "create"
                ? "Add Card"
                : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
