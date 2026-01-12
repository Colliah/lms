"use client";

import { Book, BookOpen, Loader2, Sparkles, Volume2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  getCollocationsAction,
  getDictionaryDefinitionAction,
  getIdiomsAction,
  getPhrasalVerbsAction,
  getThesaurusDataAction,
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
import { Separator } from "@/components/ui/separator";
import type { AIResourceEntry } from "@/lib/gemini";
import type { DictionaryEntry, ThesaurusEntry } from "@/lib/merriam-webster";

interface WordEnhancementsProps {
  word: string;
}

export function WordEnhancements({ word }: WordEnhancementsProps) {
  // AI-powered enhancements state
  const [wordFamily, setWordFamily] = useState<string[]>([]);
  const [collocations, setCollocations] = useState<AIResourceEntry[]>([]);
  const [phrasalVerbs, setPhrasalVerbs] = useState<AIResourceEntry[]>([]);
  const [idioms, setIdioms] = useState<AIResourceEntry[]>([]);

  // Merriam-Webster state
  const [dictionaryEntry, setDictionaryEntry] =
    useState<DictionaryEntry | null>(null);
  const [thesaurusEntry, setThesaurusEntry] = useState<ThesaurusEntry | null>(
    null,
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [loading, setLoading] = useState<{
    wordFamily: boolean;
    collocations: boolean;
    phrasalVerbs: boolean;
    idioms: boolean;
    dictionary: boolean;
    thesaurus: boolean;
  }>({
    wordFamily: false,
    collocations: false,
    phrasalVerbs: false,
    idioms: false,
    dictionary: false,
    thesaurus: false,
  });

  // AI-powered enhancement loaders
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

  // Merriam-Webster loaders
  async function loadDictionary() {
    setLoading((prev) => ({ ...prev, dictionary: true }));
    const result = await getDictionaryDefinitionAction(word);
    if (result.success && result.data) {
      setDictionaryEntry(result.data);
    } else if (result.success && !result.data) {
      toast.info("Word not found in Merriam-Webster Dictionary");
    } else {
      toast.error(result.error || "Failed to load dictionary");
    }
    setLoading((prev) => ({ ...prev, dictionary: false }));
  }

  async function loadThesaurus() {
    setLoading((prev) => ({ ...prev, thesaurus: true }));
    const result = await getThesaurusDataAction(word);
    if (result.success && result.data) {
      setThesaurusEntry(result.data);
    } else if (result.success && !result.data) {
      toast.info("Word not found in Merriam-Webster Thesaurus");
    } else {
      toast.error(result.error || "Failed to load thesaurus");
    }
    setLoading((prev) => ({ ...prev, thesaurus: false }));
  }

  async function playPronunciation(audioUrl: string) {
    if (isPlayingAudio) return;

    setIsPlayingAudio(true);
    try {
      const audio = new Audio(audioUrl);
      await audio.play();
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        toast.error("Failed to play audio");
      };
    } catch {
      setIsPlayingAudio(false);
      toast.error("Failed to play audio");
    }
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Merriam-Webster Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Book className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold">Merriam-Webster</h3>
        </div>

        {/* Dictionary Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Dictionary
            </CardTitle>
            <CardDescription className="text-xs">
              Official definitions from Merriam-Webster
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!dictionaryEntry ? (
              <Button
                size="sm"
                variant="outline"
                onClick={loadDictionary}
                disabled={loading.dictionary}
              >
                {loading.dictionary && (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                )}
                Show Dictionary
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Word and Pronunciation */}
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">
                    {dictionaryEntry.word}
                  </span>
                  {dictionaryEntry.partOfSpeech && (
                    <Badge variant="secondary">
                      {dictionaryEntry.partOfSpeech}
                    </Badge>
                  )}
                  {dictionaryEntry.pronunciations.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        /{dictionaryEntry.pronunciations[0].notation}/
                      </span>
                      {dictionaryEntry.pronunciations[0].audioUrl && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => {
                            const audioUrl =
                              dictionaryEntry.pronunciations[0].audioUrl;
                            if (audioUrl) {
                              playPronunciation(audioUrl);
                            }
                          }}
                          disabled={isPlayingAudio}
                        >
                          <Volume2
                            className={`h-4 w-4 ${isPlayingAudio ? "animate-pulse" : ""}`}
                          />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Definitions */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Definitions
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {dictionaryEntry.shortDefinitions.map((def) => (
                      <li key={def}>{def}</li>
                    ))}
                  </ol>
                </div>

                {/* Examples */}
                {dictionaryEntry.examples.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Examples
                    </p>
                    <div className="space-y-1">
                      {dictionaryEntry.examples.slice(0, 3).map((example) => (
                        <p
                          key={example}
                          className="text-sm italic text-muted-foreground"
                        >
                          "{example}"
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Etymology */}
                {dictionaryEntry.etymology && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Etymology
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {dictionaryEntry.etymology}
                    </p>
                  </div>
                )}

                {/* First Known Use */}
                {dictionaryEntry.firstKnownUse && (
                  <p className="text-xs text-muted-foreground">
                    First known use: {dictionaryEntry.firstKnownUse}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Thesaurus Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Thesaurus</CardTitle>
            <CardDescription className="text-xs">
              Synonyms, antonyms, and related words
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!thesaurusEntry ? (
              <Button
                size="sm"
                variant="outline"
                onClick={loadThesaurus}
                disabled={loading.thesaurus}
              >
                {loading.thesaurus && (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                )}
                Show Thesaurus
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Definition context */}
                {thesaurusEntry.definition && (
                  <p className="text-sm text-muted-foreground italic">
                    {thesaurusEntry.definition}
                  </p>
                )}

                {/* Synonyms */}
                {thesaurusEntry.synonyms.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Synonyms
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {thesaurusEntry.synonyms.slice(0, 12).map((syn) => (
                        <Badge
                          key={syn}
                          variant="secondary"
                          className="text-xs"
                        >
                          {syn}
                        </Badge>
                      ))}
                      {thesaurusEntry.synonyms.length > 12 && (
                        <Badge variant="outline" className="text-xs">
                          +{thesaurusEntry.synonyms.length - 12} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Antonyms */}
                {thesaurusEntry.antonyms.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Antonyms
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {thesaurusEntry.antonyms.slice(0, 8).map((ant) => (
                        <Badge
                          key={ant}
                          variant="outline"
                          className="text-xs border-red-200 text-red-700 dark:border-red-800 dark:text-red-300"
                        >
                          {ant}
                        </Badge>
                      ))}
                      {thesaurusEntry.antonyms.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{thesaurusEntry.antonyms.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Related Words */}
                {thesaurusEntry.relatedWords.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Related Words
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {thesaurusEntry.relatedWords.slice(0, 8).map((rel) => (
                        <Badge
                          key={rel}
                          variant="outline"
                          className="text-xs border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                        >
                          {rel}
                        </Badge>
                      ))}
                      {thesaurusEntry.relatedWords.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{thesaurusEntry.relatedWords.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* AI-Powered Enhancements Section */}
      <div className="space-y-4">
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
    </div>
  );
}
