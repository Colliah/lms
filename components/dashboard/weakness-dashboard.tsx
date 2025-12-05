"use client";

import {
  AlertTriangle,
  BookOpen,
  Brain,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { analyzeWeaknessesAction } from "@/actions/weakness";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface Weakness {
  category: string;
  specificArea: string;
  severity: number;
  suggestions: string[];
  stats: {
    total: number;
    failed: number;
    accuracy: number;
  };
}

const categoryIcons: Record<string, typeof Brain> = {
  vocabulary: BookOpen,
  grammar: Brain,
  reading: TrendingUp,
};

const severityColors: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

function getSeverityLevel(severity: number): "high" | "medium" | "low" {
  if (severity >= 7) return "high";
  if (severity >= 4) return "medium";
  return "low";
}

export function WeaknessDashboard() {
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadWeaknesses = useCallback(async () => {
    setIsAnalyzing(true);
    const result = await analyzeWeaknessesAction();
    if (result.success && result.data) {
      setWeaknesses(result.data);
    }
    setIsAnalyzing(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadWeaknesses();
  }, [loadWeaknesses]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {["a", "b", "c", "d"].map((key) => (
            <Skeleton key={key} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Weakness Analysis
          </h2>
          <p className="text-muted-foreground">
            Areas that need improvement based on your performance
          </p>
        </div>
        <Button
          onClick={loadWeaknesses}
          disabled={isAnalyzing}
          variant="outline"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`}
          />
          Refresh Analysis
        </Button>
      </div>

      {weaknesses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <TrendingUp className="h-12 w-12 mx-auto text-green-500" />
            <h3 className="text-lg font-semibold">Great Progress!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No significant weaknesses detected. Keep practicing regularly to
              maintain your skills!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {weaknesses.map((weakness) => {
            const Icon = categoryIcons[weakness.category] || AlertTriangle;
            const level = getSeverityLevel(weakness.severity);

            return (
              <Card key={`${weakness.category}-${weakness.specificArea}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          level === "high"
                            ? "bg-red-100 dark:bg-red-950"
                            : level === "medium"
                              ? "bg-yellow-100 dark:bg-yellow-950"
                              : "bg-green-100 dark:bg-green-950"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            level === "high"
                              ? "text-red-600"
                              : level === "medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {weakness.specificArea}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {weakness.category}
                        </p>
                      </div>
                    </div>
                    <Badge className={severityColors[level]}>
                      {level === "high"
                        ? "Needs Work"
                        : level === "medium"
                          ? "Improving"
                          : "Good"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Accuracy Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span className="font-medium">
                        {weakness.stats.accuracy}%
                      </span>
                    </div>
                    <Progress value={weakness.stats.accuracy} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-medium">
                        {weakness.stats.total}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed: </span>
                      <span className="font-medium text-red-600">
                        {weakness.stats.failed}
                      </span>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Suggestions:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {weakness.suggestions.slice(0, 2).map((suggestion) => (
                        <li key={suggestion} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
