import { api } from "@/lib/api";
import type { CheckProfileExistsResponse } from "@scholatempus/shared";

/**
 * Check if a user profile exists on the server.
 * This function is designed for use in middleware/server-side contexts.
 * 
 * @returns `true` if profile exists, `false` otherwise (including on errors)
 */
export async function checkProfileExists(
): Promise<boolean> {
  try {
    const response = await api.get<CheckProfileExistsResponse>("/profile/exists");
    console.log("response", response);

    const exists = response.data.exists ?? false;
    if (!exists) {
      await fetch("/api/user/update-profile-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileExists: false }),
      }).catch(() => {});
    }
    return exists;
  } catch (error) {
    // On error, return false to avoid blocking users
    // The page components can handle the error state
    console.error("Profile check error:", error);
    return false;
  }
}
