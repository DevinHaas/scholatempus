import { edenClient } from "@/lib/eden";

/**
 * Check if a user profile exists on the server.
 * This function is designed for use in middleware/server-side contexts.
 *
 * @returns `true` if profile exists, `false` otherwise (including on errors)
 */
export async function checkProfileExists(): Promise<boolean> {
  try {
    const { data, error } = await edenClient.profile.exists.get();
    if (error) return false;

    const exists = data?.exists ?? false;
    if (!exists) {
      await fetch("/api/user/update-profile-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileExists: false }),
      }).catch(() => {});
    }
    return exists;
  } catch (error) {
    console.error("Profile check error:", error);
    return false;
  }
}
