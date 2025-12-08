"use client";

import { useState, useTransition } from "react";
import { Search, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CardItem } from "./card-item";
import { CardForm } from "./card-form";
import type { VocabCard } from "@/types/vocab";

interface CardListProps {
  categoryId: string;
  initialCards: VocabCard[];
}

export function CardList({ categoryId, initialCards }: CardListProps) {
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const filteredCards = search
    ? initialCards.filter(
        (card) =>
          card.word.toLowerCase().includes(search.toLowerCase()) ||
          card.meaning.toLowerCase().includes(search.toLowerCase())
      )
    : initialCards;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            value={search}
            onChange={(e) => {
              startTransition(() => {
                setSearch(e.target.value);
              });
            }}
            className="pl-9"
          />
        </div>
        <CardForm mode="create" categoryId={categoryId} />
      </div>

      {filteredCards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => (
            <CardItem key={card.id} card={card} categoryId={categoryId} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Layers className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">
            {search ? "No cards found" : "No cards yet"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search
              ? `No cards match "${search}"`
              : "Add your first vocabulary card to this category."}
          </p>
          {!search && (
            <div className="mt-4">
              <CardForm mode="create" categoryId={categoryId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
