"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getStoredWeaknesses, identifyWeaknesses } from "@/services/weakness";

export async function analyzeWeaknessesAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const weaknesses = await identifyWeaknesses(session.user.id);
    return { success: true, data: weaknesses };
  } catch (error) {
    console.error("analyzeWeaknessesAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to analyze weaknesses",
    };
  }
}

export async function getWeaknessesAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const weaknesses = await getStoredWeaknesses(session.user.id);
    return { success: true, data: weaknesses };
  } catch (error) {
    console.error("getWeaknessesAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch weaknesses",
    };
  }
}
