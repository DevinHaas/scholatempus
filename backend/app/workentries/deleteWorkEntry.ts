import log from "encore.dev/log";
import { api, APIError } from "encore.dev/api";
import { DeleteWorkEntryResponse } from "~/shared/api-types";
import { getAuthData } from "~encore/auth";
import { db } from "../../db";
import { workTimeEntryTable } from "../../db/schema";
import { eq, and } from "drizzle-orm";

export const deleteWorkEntry = api(
  {
    path: "/workentries/:id",
    method: "DELETE",
    auth: true,
  },
  async (params: { id: number }): Promise<DeleteWorkEntryResponse> => {
    const authData = getAuthData();

    if (!authData?.userID) {
      throw APIError.unauthenticated("Not authenticated");
    }

    const userId = authData.userID;
    const entryId = params.id;

    log.info("Deleting work entry", { userId, entryId });

    try {
      // Verify entry belongs to user
      const [entry] = await db
        .select()
        .from(workTimeEntryTable)
        .where(
          and(
            eq(workTimeEntryTable.workTimeEntryId, entryId),
            eq(workTimeEntryTable.userId, userId)
          )
        )
        .limit(1);

      if (!entry) {
        throw APIError.notFound("Work entry not found or you don't have permission to delete it");
      }

      // Delete the entry
      await db
        .delete(workTimeEntryTable)
        .where(
          and(
            eq(workTimeEntryTable.workTimeEntryId, entryId),
            eq(workTimeEntryTable.userId, userId)
          )
        );

      log.info("Work entry deleted successfully", {
        userId,
        entryId,
      });

      return {
        message: "Work entry deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting work entry", error);
      if (error instanceof APIError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error("Failed to delete work entry", {
        userId,
        entryId,
        error: errorMessage,
      });

      throw APIError.internal(
        "Failed to delete work entry. Please try again.",
        error as Error,
      );
    }
  },
);

