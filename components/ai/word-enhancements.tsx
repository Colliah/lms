"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  getCollocationsAction,
  getIdiomsAction,
  getPhrasalVerbsAction,
  getWordFamilyAction,
} from "@/actions/ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AIResourceEntry } from "@/lib/gemini";

interface WordEnhancementsProps {
  word: string;
}

export function WordEnhancements({ word }: WordEnhancementsProps) {
  const [wordFamily, setWordFamily] = useState<string[]>([]);
  const [collocations, setCollocations] = useState<AIResourceEntry[]>([]);
  const [phrasalVerbs, setPhrasalVerbs] = useState<AIResourceEntry[]>([]);
  const [idioms, setIdioms] = useState<AIResourceEntry[]>([]);
  const [loading, setLoading] = useState<{
    wordFamily: boolean;
    collocations: boolean;
    phrasalVerbs: boolean;
    idioms: boolean;
  }>({
    wordFamily: false,
    collocations: false,
    phrasalVerbs: false,
    idioms: false,
  });

  async function loadWordFamily() {
    setLoading((prev) => ({ ...prev, wordFamily: true }));
    const result = await getWordFamilyAction(word);
    if (result.success && result.data) {
      setWordFamily(result.data);
    }
    setLoading((prev) => ({ ...prev, wordFamily: false }));
  }

  async function loadCollocations() {
    setLoading((prev) => ({ ...prev, collocations: true }));
    const result = await getCollocationsAction(word);
    if (result.success && result.data) {
      setCollocations(result.data);
    }
    setLoading((prev) => ({ ...prev, collocations: false }));
  }

  async function loadPhrasalVerbs() {
    setLoading((prev) => ({ ...prev, phrasalVerbs: true }));
    const result = await getPhrasalVerbsAction(word);
    if (result.success && result.data) {
      setPhrasalVerbs(result.data);
    }
    setLoading((prev) => ({ ...prev, phrasalVerbs: false }));
  }

  async function loadIdioms() {
    setLoading((prev) => ({ ...prev, idioms: true }));
    const result = await getIdiomsAction(word);
    if (result.success && result.data) {
      setIdioms(result.data);
    }
    setLoading((prev) => ({ ...prev, idioms: false }));
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-yellow-500" />
        <h3 className="text-sm font-semibold">AI-Powered Enhancements</h3>
      </div>

      {/* Word Family */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Word Family</CardTitle>
          <CardDescription className="text-xs">
            Related word forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wordFamily.length === 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={loadWordFamily}
              disabled={loading.wordFamily}
            >
              {loading.wordFamily && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Show Word Family
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {wordFamily.map((form) => (
                <Badge key={form} variant="secondary">
                  {form}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collocations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Collocations</CardTitle>
          <CardDescription className="text-xs">
            Common word combinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {collocations.length === 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={loadCollocations}
              disabled={loading.collocations}
            >
              {loading.collocations && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Show Collocations
            </Button>
          ) : (
            <div className="space-y-2">
              {collocations.map((item) => (
                <div key={item.phrase} className="text-sm">
                  <p className="font-semibold">{item.phrase}</p>
                  <p className="text-muted-foreground">
                    {item.meaning} • {item.vietnamese}
                  </p>
                  <p className="text-xs italic">"{item.example}"</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phrasal Verbs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Phrasal Verbs</CardTitle>
          <CardDescription className="text-xs">
            Verb + preposition/adverb combinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {phrasalVerbs.length === 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={loadPhrasalVerbs}
              disabled={loading.phrasalVerbs}
            >
              {loading.phrasalVerbs && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Show Phrasal Verbs
            </Button>
          ) : (
            <div className="space-y-2">
              {phrasalVerbs.map((item) => (
                <div key={item.phrase} className="text-sm">
                  <p className="font-semibold">{item.phrase}</p>
                  <p className="text-muted-foreground">
                    {item.meaning} • {item.vietnamese}
                  </p>
                  <p className="text-xs italic">"{item.example}"</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Idioms */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Idioms</CardTitle>
          <CardDescription className="text-xs">
            Expressions with figurative meanings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {idioms.length === 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={loadIdioms}
              disabled={loading.idioms}
            >
              {loading.idioms && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Show Idioms
            </Button>
          ) : (
            <div className="space-y-2">
              {idioms.map((item) => (
                <div key={item.phrase} className="text-sm">
                  <p className="font-semibold">{item.phrase}</p>
                  <p className="text-muted-foreground">
                    {item.meaning} • {item.vietnamese}
                  </p>
                  <p className="text-xs italic">"{item.example}"</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
