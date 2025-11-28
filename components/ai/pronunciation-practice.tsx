"use client";

import { Mic, MicOff, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { evaluatePronunciationAction } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TTSService } from "@/lib/tts";

interface PronunciationPracticeProps {
  targetWord: string;
  phonetic?: string;
}

export function PronunciationPractice({
  targetWord,
  phonetic,
}: PronunciationPracticeProps) {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spokenText, setSpokenText] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const recognitionRef = useRef<any>(null);

  async function speakWord() {
    if (isPlaying) return;

    setIsPlaying(true);
    try {
      await TTSService.speak(targetWord);
    } finally {
      setIsPlaying(false);
    }
  }

  function startListening() {
    if (
      typeof window === "undefined" ||
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setSpokenText("");
      setFeedback("");
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);
      setIsListening(false);

      // Evaluate pronunciation
      setIsEvaluating(true);
      try {
        const result = await evaluatePronunciationAction(
          targetWord,
          transcript,
        );
        if (result.success && result.data) {
          setFeedback(result.data);
        } else {
          toast.error("Failed to evaluate pronunciation");
        }
      } finally {
        setIsEvaluating(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      toast.error(`Recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pronunciation Practice</span>
          {phonetic && (
            <span className="text-sm font-normal text-muted-foreground">
              {phonetic}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Practice saying "{targetWord}" and get AI feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Target Word Display */}
        <div className="text-center py-6 bg-muted/50 rounded-lg">
          <h2 className="text-4xl font-bold mb-2">{targetWord}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={speakWord}
            disabled={isPlaying}
          >
            <Volume2
              className={`h-4 w-4 mr-2 ${isPlaying ? "animate-pulse" : ""}`}
            />
            Listen to Pronunciation
          </Button>
        </div>

        {/* Recording Controls */}
        <div className="flex justify-center">
          {!isListening ? (
            <Button size="lg" onClick={startListening} className="gap-2">
              <Mic className="h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <Button
              size="lg"
              variant="destructive"
              onClick={stopListening}
              className="gap-2 animate-pulse"
            >
              <MicOff className="h-5 w-5" />
              Stop Recording
            </Button>
          )}
        </div>

        {/* What was heard */}
        {spokenText && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-1">What I heard:</p>
            <p className="text-lg">{spokenText}</p>
          </div>
        )}

        {/* AI Feedback */}
        {isEvaluating && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Evaluating pronunciation...
            </p>
          </div>
        )}

        {feedback && !isEvaluating && (
          <div className="p-4 bg-primary/10 rounded-lg prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            • Click "Listen to Pronunciation" to hear the correct pronunciation
          </p>
          <p>• Click "Start Recording" and say the word clearly</p>
          <p>• Get instant AI feedback on your pronunciation</p>
          <p>• Works best in Chrome, Edge, or Safari</p>
        </div>
      </CardContent>
    </Card>
  );
}
