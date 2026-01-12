"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getDashboardStats,
  incrementStreak,
  logStudySession,
} from "@/services/progress";

export async function getDashboardStatsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getDashboardStats({ userId: session.user.id });
    return { success: true, data: result };
  } catch (error) {
    console.error("getDashboardStatsAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard data",
    };
  }
}

export async function logStudySessionAction(data: {
  module: string;
  duration: number;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await logStudySession({
      userId: session.user.id,
      module: data.module,
      duration: data.duration,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("logStudySessionAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to log session",
    };
  }
}

export async function checkInAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await incrementStreak({ userId: session.user.id });
    return { success: true, data: result };
  } catch (error) {
    console.error("checkInAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check in",
    };
  }
}
