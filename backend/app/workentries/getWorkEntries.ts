import { api, APIError } from "encore.dev/api";
import path from "path";
import { getAuthData } from "~encore/auth";
import { db } from "../../db";
import { workTimeEntryTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { GetWorkEntriesResponse } from "~/shared/api-types";


export const getWorkEntries = api(
  {
    auth: true,
    path: "/workentries",
    method: "GET",
  },
  async () : Promise<GetWorkEntriesResponse> => {
    const authData = getAuthData();
    console.log("getWorkEntries");
    if (!authData) {
      throw APIError.unauthenticated("Not authenticated");
    }

    const userId = authData.userID;

    try {
      const workEntries = await db
        .select()
        .from(workTimeEntryTable)
        .where(eq(workTimeEntryTable.userId, userId));
      
      console.log("work entries", workEntries);

      return {
        message: "Worktime entries fetched successfully",
        workEntries,
      };
    } catch (error) {
      console.log("error", error);
      throw APIError.notFound("Workentries could not be found for user");
    }
  },
);
