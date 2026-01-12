"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  generateAnalyticsSnapshot,
  getDetailedAnalytics,
} from "@/services/analytics";

export async function getDetailedAnalyticsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getDetailedAnalytics(session.user.id);
    return { success: true, data: result };
  } catch (error) {
    console.error("getDetailedAnalyticsAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch analytics",
    };
  }
}

export async function generateAnalyticsSnapshotAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await generateAnalyticsSnapshot({
      userId: session.user.id,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("generateAnalyticsSnapshotAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate snapshot",
    };
  }
}
