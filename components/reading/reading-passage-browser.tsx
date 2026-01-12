"use client";

import { useState } from "react";
import type { ProficiencyLevel } from "@/app/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { ReadingPassageCard } from "./reading-passage-card";

interface Passage {
  id: string;
  title: string;
  difficulty: ProficiencyLevel;
  topics: string[];
  wordCount: number;
  questionCount: number;
  userProgress: { completed: boolean; score: number | null } | null;
}

interface ReadingPassageBrowserProps {
  passages: Passage[];
}

const levels: (ProficiencyLevel | "ALL")[] = [
  "ALL",
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

export function ReadingPassageBrowser({
  passages,
}: ReadingPassageBrowserProps) {
  const [filter, setFilter] = useState<ProficiencyLevel | "ALL">("ALL");

  const filteredPassages =
    filter === "ALL"
      ? passages
      : passages.filter((p) => p.difficulty === filter);

  const completedCount = passages.filter(
    (p) => p.userProgress?.completed,
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="text-sm text-muted-foreground">
        {completedCount} of {passages.length} passages completed
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {levels.map((level) => (
          <Button
            key={level}
            variant={filter === level ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(level)}
          >
            {level === "ALL" ? "All Levels" : level}
          </Button>
        ))}
      </div>

      {/* Passages Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPassages.map((passage) => (
          <ReadingPassageCard key={passage.id} passage={passage} />
        ))}
      </div>

      {filteredPassages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No passages found for {filter} level.
        </div>
      )}
    </div>
  );
}
