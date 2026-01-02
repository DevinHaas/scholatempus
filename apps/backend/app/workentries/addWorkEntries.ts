import log from "encore.dev/log";
import { api, APIError } from "encore.dev/api";
import {
  AddWorkEntriesRequest,
  AddWorkEntriesResponse,
  WorkTimeCategory,
  WORKTIME_SUBCATEGORIES,
} from "@scholatempus/shared";
import { getAuthData } from "~encore/auth";
import { db } from "../../db";
import { workTimeEntryTable, profileTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export const addWorkEntries = api(
  {
    path: "/workentries",
    method: "POST",
    auth: true,
  },
  async (
    params: AddWorkEntriesRequest,
  ): Promise<AddWorkEntriesResponse> => {
    const authData = getAuthData();

    if (!authData?.userID) {
      throw APIError.unauthenticated("Not authenticated");
    }

    const userId = authData.userID;

    log.info("Adding work entries", { userId, entryCount: params.entries.length });

    try {
      // Check if profile exists (required for foreign key constraint)
      const profile = await db
        .select()
        .from(profileTable)
        .where(eq(profileTable.userId, userId))
        .limit(1);

      if (!profile || profile.length === 0) {
        throw APIError.notFound(
          "Profile not found. Please complete your profile setup before adding work entries.",
        );
      }

      console.log("entrie", params.entries);
      // Validate entries
      for (const entry of params.entries) {
        // Validate working time
        if (entry.workingTime <= 0) {
          throw APIError.invalidArgument(
            "Working time must be greater than 0",
          );
        }

        // Validate category
        if (!Object.values(WorkTimeCategory).includes(entry.category as WorkTimeCategory)) {
          throw APIError.invalidArgument(`Invalid category: ${entry.category}`);
        }

        // Validate subcategory for TeachingAdvisingSupporting category
        if (
          entry.category === WorkTimeCategory.TeachingAdvisingSupporting &&
          !entry.subcategory
        ) {
          throw APIError.invalidArgument(
            "Subcategory is required for 'Unterrichten, beraten, begleiten' category",
          );
        }



      }

      // Insert entries in a transaction
      const result = await db.transaction(async (tx) => {
        const insertedEntries = [];

        for (const entry of params.entries) {
          const [insertedEntry] = await tx
            .insert(workTimeEntryTable)
            .values({
              userId: userId,
              date: new Date(), // Create timestamp in backend
              workingTime: entry.workingTime,
              category: entry.category as WorkTimeCategory,
              subcategory: (entry.subcategory ?? null) as WORKTIME_SUBCATEGORIES | null,
              isManually: entry.isManually ?? false,
            })
            .returning();

          insertedEntries.push(insertedEntry);
        }

        return insertedEntries;
      });

      log.info("Work entries added successfully", {
        userId,
        count: result.length,
      });

      return {
        message: "Work entries added successfully",
        count: result.length,
      };
    } catch (error) {
      console.error("Error adding work entries", error);
      if (error instanceof APIError) {
        throw error;
      }

      // Check for foreign key constraint violations
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("foreign key") ||
        errorMessage.includes("violates foreign key constraint") ||
        errorMessage.includes("workTimeEntry_userId_profile_userId_fk")
      ) {
        log.error("Profile not found when adding work entries", {
          userId,
          error: errorMessage,
        });
        throw APIError.notFound(
          "Profile not found. Please complete your profile setup before adding work entries.",
        );
      }

      log.error("Failed to add work entries", {
        userId,
        error: errorMessage,
      });

      throw APIError.internal(
        "Failed to add work entries. Please try again.",
        error as Error,
      );
    }
  },
);
