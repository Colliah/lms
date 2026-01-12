"use client";

import { ArrowLeft, Mic, Volume2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitPronunciationAction } from "@/actions/speaking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Exercise {
  id: string;
  targetPhrase: string;
  phonetic: string | null;
  audioUrl: string;
  tips: string | null;
}

interface PronunciationPracticeProps {
  exercise: Exercise;
}

export default function PronunciationPractice({
  exercise,
}: PronunciationPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const router = useRouter();

  function playAudio() {
    if (!isPlaying) {
      setIsPlaying(true);
      const audio = new Audio(exercise.audioUrl);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  }

  function handleRecord() {
    setIsRecording(true);
    // Simulate recording for 2 seconds
    setTimeout(() => {
      setIsRecording(false);
      setHasRecorded(true);
    }, 2000);
  }

  async function handleSubmit() {
    setIsSubmitting(true);

    // For now, we'll submit with a placeholder URL
    // In a real app, you'd upload the recording to cloud storage first
    const result = await submitPronunciationAction({
      exerciseId: exercise.id,
      recordingUrl: "placeholder-recording-url",
    });

    if (result.success && result.data) {
      setScore(result.data.score);
      setIsSubmitted(true);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {!isSubmitted ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pronunciation Exercise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8 space-y-4">
                <h2 className="text-5xl font-bold">{exercise.targetPhrase}</h2>
                {exercise.phonetic && (
                  <p className="text-2xl text-muted-foreground">
                    {exercise.phonetic}
                  </p>
                )}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={playAudio}
                  disabled={isPlaying}
                  size="lg"
                  variant="outline"
                >
                  <Volume2
                    className={`h-5 w-5 mr-2 ${isPlaying ? "animate-pulse" : ""}`}
                  />
                  {isPlaying ? "Playing..." : "Play Native Audio"}
                </Button>
              </div>

              {exercise.tips && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Pronunciation Tip
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    {exercise.tips}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Record Your Pronunciation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center py-8">
                <Button
                  onClick={handleRecord}
                  disabled={isRecording}
                  size="lg"
                  className="h-32 w-32 rounded-full"
                  variant={hasRecorded ? "outline" : "default"}
                >
                  <Mic
                    className={`h-16 w-16 ${isRecording ? "animate-pulse" : ""}`}
                  />
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {isRecording
                  ? "Recording..."
                  : hasRecorded
                    ? "Recording complete! Click again to re-record."
                    : "Click the microphone to start recording"}
              </p>

              {hasRecorded && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? "Analyzing..." : "Submit Recording"}
                  </Button>
                </div>
              )}

              <div className="text-xs text-muted-foreground text-center mt-4">
                <p>
                  Note: Audio recording is currently simulated. In production,
                  this would use the Web Audio API to capture your
                  pronunciation.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pronunciation Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="text-7xl font-bold text-primary mb-4">
                {score}%
              </div>
              <p className="text-muted-foreground">
                {score && score >= 80
                  ? "Excellent pronunciation! 🎉"
                  : score && score >= 60
                    ? "Good job! Keep practicing! 👍"
                    : "Keep practicing to improve! 💪"}
              </p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-semibold mb-2">Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Your pronunciation is developing well. Focus on the stressed
                syllables and try to match the native speaker's intonation.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => router.push("/")} variant="outline">
                Back to Dashboard
              </Button>
              <Button onClick={() => router.refresh()}>
                Try Another Exercise
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
