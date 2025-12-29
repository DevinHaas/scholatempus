import log from "encore.dev/log";
import { api, APIError } from "encore.dev/api";
import {
  UpdateWorkEntryRequest,
  UpdateWorkEntryResponse,
} from "~/shared/api-types";
import { getAuthData } from "~encore/auth";
import { db } from "../../db";
import { workTimeEntryTable } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import {
  WorkTimeCategory,
  WORKTIME_SUBCATEGORIES,
} from "~/shared/enums";

export const updateWorkEntry = api(
  {
    path: "/workentries/:id",
    method: "PUT",
    auth: true,
  },
  async (
    params: UpdateWorkEntryRequest & { id: number },
  ): Promise<UpdateWorkEntryResponse> => {
    const authData = getAuthData();

    if (!authData?.userID) {
      throw APIError.unauthenticated("Not authenticated");
    }

    const userId = authData.userID;
    const entryId = params.id;
    const updateData: UpdateWorkEntryRequest = {
      category: params.category,
      subcategory: params.subcategory,
      workingTime: params.workingTime,
      date: params.date,
    };

    log.info("Updating work entry", { userId, entryId });

    try {
      // Verify entry belongs to user
      const [existingEntry] = await db
        .select()
        .from(workTimeEntryTable)
        .where(
          and(
            eq(workTimeEntryTable.workTimeEntryId, entryId),
            eq(workTimeEntryTable.userId, userId)
          )
        )
        .limit(1);

      if (!existingEntry) {
        throw APIError.notFound("Work entry not found or you don't have permission to update it");
      }

      // Validate working time
      if (updateData.workingTime <= 0) {
        throw APIError.invalidArgument(
          "Working time must be greater than 0",
        );
      }

      // Validate category
      if (!Object.values(WorkTimeCategory).includes(updateData.category as WorkTimeCategory)) {
        throw APIError.invalidArgument(`Invalid category: ${updateData.category}`);
      }

      // Validate subcategory for TeachingAdvisingSupporting category
      if (
        updateData.category === WorkTimeCategory.TeachingAdvisingSupporting &&
        !updateData.subcategory
      ) {
        throw APIError.invalidArgument(
          "Subcategory is required for 'Unterrichten, beraten, begleiten' category",
        );
      }

      // Update the entry
      const [updatedEntry] = await db
        .update(workTimeEntryTable)
        .set({
          workingTime: updateData.workingTime,
          category: updateData.category as WorkTimeCategory,
          subcategory: (updateData.subcategory ?? null) as WORKTIME_SUBCATEGORIES | null,
          date: updateData.date ? updateData.date : existingEntry.date,
        })
        .where(
          and(
            eq(workTimeEntryTable.workTimeEntryId, entryId),
            eq(workTimeEntryTable.userId, userId)
          )
        )
        .returning();

      log.info("Work entry updated successfully", {
        userId,
        entryId,
      });

      return {
        message: "Work entry updated successfully",
        workEntry: {
          workTimeEntryId: updatedEntry.workTimeEntryId,
          userId: updatedEntry.userId,
          date: updatedEntry.date,
          workingTime: updatedEntry.workingTime,
          category: updatedEntry.category,
          subcategory: updatedEntry.subcategory,
          isManually: updatedEntry.isManually,
        },
      };
    } catch (error) {
      console.error("Error updating work entry", error);
      if (error instanceof APIError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error("Failed to update work entry", {
        userId,
        entryId,
        error: errorMessage,
      });

      throw APIError.internal(
        "Failed to update work entry. Please try again.",
        error as Error,
      );
    }
  },
);

