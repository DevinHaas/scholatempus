import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../../db";
import { profileTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { CheckProfileExistsResponse } from "@scholatempus/shared";

export const checkProfileExists = api(
  {
    auth: true,
    method: "GET",
    path: "/profile/exists",
  },
  async (): Promise<CheckProfileExistsResponse> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Not authenticated");
    }
    const userId = authData.userID;

    try {
      const profile = await db
        .select({ userId: profileTable.userId })
        .from(profileTable)
        .where(eq(profileTable.userId, userId))
        .limit(1);

      return {
        exists: profile.length > 0,
      };
    } catch (e) {
      console.error("Database error:", e);
      throw APIError.internal("could not check profile existence");
    }
  },
);







