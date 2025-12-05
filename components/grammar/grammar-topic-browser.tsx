"use client";

import { useState } from "react";
import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { GrammarTopicCard } from "./grammar-topic-card";

interface Topic {
  id: string;
  name: string;
  description: string;
  difficulty: ProficiencyLevel;
  exerciseCount: number;
  questionCount: number;
  userProgress: { completed: number; total: number } | null;
}

interface GrammarTopicBrowserProps {
  topics: Topic[];
}

const levels: ProficiencyLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function GrammarTopicBrowser({ topics }: GrammarTopicBrowserProps) {
  const [filter, setFilter] = useState<ProficiencyLevel | "ALL">("ALL");

  const filteredTopics =
    filter === "ALL" ? topics : topics.filter((t) => t.difficulty === filter);

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("ALL")}
        >
          All Levels
        </Button>
        {levels.map((level) => (
          <Button
            key={level}
            variant={filter === level ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(level)}
          >
            {level}
          </Button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTopics.map((topic) => (
          <GrammarTopicCard key={topic.id} topic={topic} />
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No topics found for {filter} level.
        </div>
      )}
    </div>
  );
}
