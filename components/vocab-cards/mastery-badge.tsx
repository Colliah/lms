"use client";

import { MasteryLevel } from "@/app/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MasteryBadgeProps {
  level: MasteryLevel;
  className?: string;
  showLabel?: boolean;
}

const masteryConfig: Record<
  MasteryLevel,
  { label: string; className: string; icon: string }
> = {
  NEW: {
    label: "New",
    className:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
    icon: "✨",
  },
  LEARNING: {
    label: "Learning",
    className:
      "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
    icon: "📖",
  },
  REVIEW: {
    label: "Review",
    className:
      "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    icon: "🔄",
  },
  MASTERED: {
    label: "Mastered",
    className:
      "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: "🏆",
  },
};

export function MasteryBadge({
  level,
  className,
  showLabel = true,
}: MasteryBadgeProps) {
  const config = masteryConfig[level];

  return (
    <Badge
      variant="outline"
      className={cn(config.className, "font-medium", className)}
    >
      <span className="mr-1">{config.icon}</span>
      {showLabel && config.label}
    </Badge>
  );
}

export function getMasteryColor(level: MasteryLevel): string {
  const colors: Record<MasteryLevel, string> = {
    NEW: "#64748b",
    LEARNING: "#f59e0b",
    REVIEW: "#3b82f6",
    MASTERED: "#10b981",
  };
  return colors[level];
}
