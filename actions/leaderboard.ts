"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getLeaderboard,
  getUserRank,
  type LeaderboardType,
} from "@/services/leaderboard";

export async function getLeaderboardAction(type: LeaderboardType = "weekly") {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const leaderboard = await getLeaderboard(session.user.id, type);
    return { success: true, data: leaderboard };
  } catch (error) {
    console.error("getLeaderboardAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch leaderboard",
    };
  }
}

export async function getUserRankAction(type: LeaderboardType = "weekly") {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const rank = await getUserRank(session.user.id, type);
    return { success: true, data: rank };
  } catch (error) {
    console.error("getUserRankAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch rank",
    };
  }
}
