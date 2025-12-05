import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLeaderboardAction } from "@/actions/leaderboard";
import {
  getSavedWordsAction,
  saveWordAction,
  unsaveWordAction,
} from "@/actions/saved-vocabulary";
import {
  getVocabularyStatsAction,
  submitVocabularyReviewAction,
} from "@/actions/vocabulary";
import type { ReviewQuality } from "@/app/generated/prisma/enums";

// Query Keys
export const queryKeys = {
  vocabularyStats: ["vocabulary", "stats"] as const,
  savedWords: (page: number) => ["vocabulary", "saved", page] as const,
  leaderboard: (type: string) => ["leaderboard", type] as const,
  weaknesses: ["weaknesses"] as const,
};

// Vocabulary Stats
export function useVocabularyStats() {
  return useQuery({
    queryKey: queryKeys.vocabularyStats,
    queryFn: async () => {
      const result = await getVocabularyStatsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 30 * 1000, // Fresh for 30 seconds
  });
}

// Saved Words
export function useSavedWords(page = 1) {
  return useQuery({
    queryKey: queryKeys.savedWords(page),
    queryFn: async () => {
      const result = await getSavedWordsAction({ page });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 60 * 1000,
  });
}

// Save Word Mutation with Optimistic Update
export function useSaveWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wordId: string) => {
      const result = await saveWordAction({ wordId });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      // Invalidate saved words queries
      queryClient.invalidateQueries({ queryKey: ["vocabulary", "saved"] });
    },
  });
}

// Unsave Word Mutation
export function useUnsaveWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wordId: string) => {
      const result = await unsaveWordAction(wordId);
      if (!result.success) throw new Error(result.error);
      return undefined;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary", "saved"] });
    },
  });
}

// Word Review Mutation with Optimistic Update
export function useSubmitWordReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      wordId,
      quality,
    }: {
      wordId: string;
      quality: ReviewQuality;
    }) => {
      const result = await submitVocabularyReviewAction({
        wordId,
        quality,
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      // Invalidate vocabulary stats to reflect updated counts
      queryClient.invalidateQueries({ queryKey: queryKeys.vocabularyStats });
    },
  });
}

// Leaderboard
export function useLeaderboard(
  type: "weekly" | "monthly" | "allTime" = "weekly",
) {
  return useQuery({
    queryKey: queryKeys.leaderboard(type),
    queryFn: async () => {
      const result = await getLeaderboardAction(type);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes (matches Prisma cache)
  });
}

// Weaknesses
export function useWeaknesses() {
  return useQuery({
    queryKey: queryKeys.weaknesses,
    queryFn: async () => {
      // Import analyzeWeaknessesAction dynamically to get full weakness data with stats
      const { analyzeWeaknessesAction } = await import("@/actions/weakness");
      const result = await analyzeWeaknessesAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // Fresh for 10 minutes
  });
}

// Review Schedule
export function useReviewSchedule() {
  return useQuery({
    queryKey: ["vocabulary", "schedule"] as const,
    queryFn: async () => {
      const { getReviewScheduleAction } = await import("@/actions/vocabulary");
      const result = await getReviewScheduleAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
  });
}

// Study Session Options
export function useStudySessionOptions() {
  return useQuery({
    queryKey: ["vocabulary", "study-options"] as const,
    queryFn: async () => {
      const { getStudySessionOptionsAction } = await import(
        "@/actions/study-session"
      );
      const result = await getStudySessionOptionsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
  });
}

// Browse Words
export function useBrowseWords(params: {
  difficulty?: string;
  categoryId?: string;
  search?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["vocabulary", "browse", params] as const,
    queryFn: async () => {
      const { browseWordsAction } = await import("@/actions/vocabulary");
      const result = await browseWordsAction({
        difficulty: params.difficulty === "ALL" ? undefined : params.difficulty as any,
        categoryId: params.categoryId === "ALL" ? undefined : params.categoryId,
        search: params.search,
        page: params.page,
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 60 * 1000, // Fresh for 1 minute
  });
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ["vocabulary", "categories"] as const,
    queryFn: async () => {
      const { getCategoriesAction } = await import("@/actions/vocabulary");
      const result = await getCategoriesAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 60 * 60 * 1000, // Fresh for 1 hour - static data
  });
}
