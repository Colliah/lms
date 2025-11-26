"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getUserRoleAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    return {
      success: true,
      data: {
        role: session.user.role || "USER",
        isAdmin: session.user.role === "ADMIN",
      },
    };
  } catch (error) {
    console.error("getUserRoleAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user role",
    };
  }
}
