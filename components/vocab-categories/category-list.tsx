"use client";

import { useState, useTransition } from "react";
import { Search, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoryCard } from "./category-card";
import { CategoryForm } from "./category-form";

interface Category {
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
}

interface CategoryListProps {
  initialCategories: Category[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const filteredCategories = search
    ? initialCategories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
      )
    : initialCategories;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              startTransition(() => {
                setSearch(e.target.value);
              });
            }}
            className="pl-9"
          />
        </div>
        <CategoryForm mode="create" />
      </div>

      {filteredCategories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">
            {search ? "No categories found" : "No categories yet"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search
              ? `No categories match "${search}"`
              : "Create your first vocabulary category to get started."}
          </p>
          {!search && (
            <div className="mt-4">
              <CategoryForm mode="create" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
