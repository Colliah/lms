import { useQuery } from "@tanstack/react-query";
import { generateLearningPathAction } from "@/actions/learning-path";
import { getDashboardStatsAction } from "@/actions/progress";

// Query Keys
export const dashboardKeys = {
  stats: ["dashboard", "stats"] as const,
  learningPath: ["dashboard", "learningPath"] as const,
};

// Dashboard Stats
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: async () => {
      const result = await getDashboardStatsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 30 * 1000, // Fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
}

// Learning Path
export function useLearningPath() {
  return useQuery({
    queryKey: dashboardKeys.learningPath,
    queryFn: async () => {
      const result = await generateLearningPathAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus - expensive operation
  });
}
