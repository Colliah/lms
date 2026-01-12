"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { type GrammarError, GrammarService } from "@/lib/grammar";

interface GrammarCheckerProps {
  initialText?: string;
  onTextChange?: (text: string) => void;
}

export function GrammarChecker({
  initialText = "",
  onTextChange,
}: GrammarCheckerProps) {
  const [text, setText] = useState(initialText);
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedError, setSelectedError] = useState<number | null>(null);

  async function checkGrammar() {
    if (!text.trim()) {
      toast.error("Please enter some text to check");
      return;
    }

    setIsChecking(true);
    try {
      const results = await GrammarService.check(text);
      setErrors(results);

      if (results.length === 0) {
        toast.success("No grammar errors found! 🎉");
      } else {
        toast.info(
          `Found ${results.length} potential ${results.length === 1 ? "issue" : "issues"}`,
        );
      }
    } catch (error) {
      console.error("Grammar check error:", error);
      toast.error("Failed to check grammar");
    } finally {
      setIsChecking(false);
    }
  }

  function applySuggestion(errorIndex: number, replacementIndex = 0) {
    const error = errors[errorIndex];
    const newText = GrammarService.applySuggestion(
      text,
      error,
      replacementIndex,
    );
    setText(newText);
    onTextChange?.(newText);

    // Remove the applied error from the list
    setErrors(errors.filter((_, i) => i !== errorIndex));
    setSelectedError(null);
    toast.success("Suggestion applied");
  }

  function getHighlightedText() {
    if (errors.length === 0) return text;

    let result = text;
    const sortedErrors = [...errors].sort((a, b) => b.offset - a.offset);

    sortedErrors.forEach((error, index) => {
      const before = result.substring(0, error.offset);
      const errorText = result.substring(
        error.offset,
        error.offset + error.length,
      );
      const after = result.substring(error.offset + error.length);

      const originalIndex = errors.indexOf(error);
      const highlight = `<mark class="${selectedError === originalIndex ? "bg-red-300 dark:bg-red-900" : "bg-yellow-200 dark:bg-yellow-900"} cursor-pointer" data-error="${originalIndex}">${errorText}</mark>`;

      result = before + highlight + after;
    });

    return result;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Grammar Checker</CardTitle>
              <CardDescription>
                AI-powered grammar and spelling check
              </CardDescription>
            </div>
            {errors.length > 0 && (
              <Badge variant="destructive">
                {errors.length} {errors.length === 1 ? "issue" : "issues"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                onTextChange?.(e.target.value);
                setErrors([]);
              }}
              className="min-h-[200px] font-mono"
            />

            {errors.length > 0 && (
              <button
                type="button"
                aria-label="Grammar errors preview. Click or press Enter on highlighted errors to see details."
                className="w-full p-4 border rounded-md bg-muted/50 cursor-pointer text-left"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: <Use for checker>
                dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === "MARK") {
                    const errorIndex = parseInt(
                      target.dataset.error || "-1",
                      10,
                    );
                    setSelectedError(errorIndex);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const target = e.target as HTMLElement;
                    if (target.tagName === "MARK") {
                      const errorIndex = parseInt(
                        target.dataset.error || "-1",
                        10,
                      );
                      setSelectedError(errorIndex);
                    }
                  }
                }}
              />
            )}
          </div>

          <Button onClick={checkGrammar} disabled={isChecking || !text.trim()}>
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Check Grammar
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Details */}
      {selectedError !== null && errors[selectedError] && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Grammar Issue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold">Message:</p>
              <p className="text-sm text-muted-foreground">
                {errors[selectedError].message}
              </p>
            </div>

            {errors[selectedError].context && (
              <div>
                <p className="text-sm font-semibold">Context:</p>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {errors[selectedError].context?.text}
                </p>
              </div>
            )}

            {errors[selectedError].replacements &&
              errors[selectedError].replacements.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {errors[selectedError].replacements.map(
                      (replacement, i) => (
                        <Button
                          key={replacement.value}
                          size="sm"
                          variant="outline"
                          onClick={() => applySuggestion(selectedError, i)}
                        >
                          "{replacement.value}"
                        </Button>
                      ),
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
