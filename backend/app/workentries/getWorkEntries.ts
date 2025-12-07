import { api, APIError } from "encore.dev/api";
import path from "path";
import { getAuthData } from "~encore/auth";
import { db } from "../../db";
import { workTimeEntryTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export const getWorkEntries = api(
  {
    auth: true,
    path: "/workentries",
    method: "GET",
  },
  async () => {
    const authData = getAuthData();
    console.log(authData);
    if (!authData) {
      throw APIError.unauthenticated("Not authenticated");
    }

    const userId = authData.userID;

    try {
      const workEntries = await db
        .select()
        .from(workTimeEntryTable)
        .where(eq(workTimeEntryTable.userId, userId));

      return {
        message: "Worktime entries fetched successfully",
        workEntries,
      };
    } catch (error) {
      return APIError.notFound("Workentries could not be found for user");
    }
  },
);
