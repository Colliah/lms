"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitWritingAction } from "@/actions/writing";
import type { WritingType } from "@/app/generated/prisma/enums";
import { GrammarChecker } from "@/components/ai/grammar-checker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface Prompt {
  id: string;
  title: string;
  prompt: string;
  type: WritingType;
  minWords?: number | null;
  maxWords?: number | null;
}

interface WritingEditorProps {
  prompt: Prompt;
}

export default function WritingEditor({ prompt }: WritingEditorProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  async function handleSubmit() {
    setIsSubmitting(true);
    const result = await submitWritingAction({
      promptId: prompt.id,
      content,
    });

    if (result.success) {
      setIsSubmitted(true);
    }
    setIsSubmitting(false);
  }

  const isValid =
    wordCount >= (prompt.minWords || 0) &&
    (!prompt.maxWords || wordCount <= prompt.maxWords);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <Badge variant="outline">{prompt.type}</Badge>
      </div>

      {!isSubmitted ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{prompt.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {prompt.prompt}
              </p>

              {(prompt.minWords || prompt.maxWords) && (
                <div className="text-sm text-muted-foreground">
                  {prompt.minWords && prompt.maxWords && (
                    <p>
                      Write between {prompt.minWords} and {prompt.maxWords}{" "}
                      words
                    </p>
                  )}
                  {prompt.minWords && !prompt.maxWords && (
                    <p>Write at least {prompt.minWords} words</p>
                  )}
                  {!prompt.minWords && prompt.maxWords && (
                    <p>Write up to {prompt.maxWords} words</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="write">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="grammar">Grammar Check</TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Response</CardTitle>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          isValid ? "text-green-600" : "text-muted-foreground"
                        }`}
                      >
                        {wordCount} words
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Start writing your response here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px] resize-none text-base"
                    disabled={isSubmitting}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isValid || wordCount === 0}
                  size="lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit Writing"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="grammar">
              <GrammarChecker initialText={content} onTextChange={setContent} />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Submitted Successfully! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your writing has been submitted and will be reviewed. You wrote{" "}
              {wordCount} words.
            </p>
            <p className="text-sm text-muted-foreground">
              AI-powered feedback will be available soon. This feature provides
              grammar scores, vocabulary suggestions, and detailed feedback to
              help you improve.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => router.push("/")} variant="outline">
                Back to Dashboard
              </Button>
              <Button onClick={() => router.refresh()}>
                Try Another Prompt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
