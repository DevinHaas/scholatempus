import { eq, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { workTimeEntryTable, profileTable } from "../../../db/schema.js";
import { WorkTimeCategory } from "@scholatempus/shared/enums";
import { AppError } from "../../lib/errors.js";
import type { WorkEntryBodyType, UpdateWorkEntryBodyType, ImportWorkEntryBodyType } from "./model.js";

export class WorkEntryService {
  static async getAll(userId: string) {
    const workEntries = await db
      .select()
      .from(workTimeEntryTable)
      .where(eq(workTimeEntryTable.userId, userId));

    return {
      message: "Worktime entries fetched successfully",
      workEntries,
    };
  }

  static async addEntries(userId: string, entries: WorkEntryBodyType[]) {
    // Check profile exists (required for foreign key constraint)
    const profile = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.userId, userId))
      .limit(1);

    if (!profile.length) {
      throw new AppError(
        404,
        "Profile not found. Please complete your profile setup before adding work entries.",
      );
    }

    // Validate entries
    for (const entry of entries) {
      if (entry.workingTime <= 0) {
        throw new AppError(400, "Working time must be greater than 0");
      }

      if (
        !Object.values(WorkTimeCategory).includes(
          entry.category as WorkTimeCategory,
        )
      ) {
        throw new AppError(400, `Invalid category: ${entry.category}`);
      }

      if (
        entry.category === WorkTimeCategory.TeachingAdvisingSupporting &&
        !entry.subcategory
      ) {
        throw new AppError(
          400,
          "Subcategory is required for 'Unterrichten, beraten, begleiten' category",
        );
      }
    }

    const result = await db.transaction(async (tx) => {
      const inserted = [];
      for (const entry of entries) {
        const [row] = await tx
          .insert(workTimeEntryTable)
          .values({
            userId,
            date: new Date(),
            workingTime: entry.workingTime,
            category: entry.category as WorkTimeCategory,
            subcategory: (entry.subcategory ?? null) as any,
          })
          .returning();
        inserted.push(row);
      }
      return inserted;
    });

    return {
      message: "Work entries added successfully",
      count: result.length,
    };
  }

  static async updateEntry(
    userId: string,
    entryId: number,
    data: UpdateWorkEntryBodyType,
  ) {
    // Verify ownership
    const [existing] = await db
      .select()
      .from(workTimeEntryTable)
      .where(
        and(
          eq(workTimeEntryTable.workTimeEntryId, entryId),
          eq(workTimeEntryTable.userId, userId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new AppError(
        404,
        "Work entry not found or you don't have permission to update it",
      );
    }

    if (data.workingTime <= 0) {
      throw new AppError(400, "Working time must be greater than 0");
    }

    if (
      !Object.values(WorkTimeCategory).includes(
        data.category as WorkTimeCategory,
      )
    ) {
      throw new AppError(400, `Invalid category: ${data.category}`);
    }

    if (
      data.category === WorkTimeCategory.TeachingAdvisingSupporting &&
      !data.subcategory
    ) {
      throw new AppError(
        400,
        "Subcategory is required for 'Unterrichten, beraten, begleiten' category",
      );
    }

    const [updated] = await db
      .update(workTimeEntryTable)
      .set({
        workingTime: data.workingTime,
        category: data.category as WorkTimeCategory,
        subcategory: (data.subcategory ?? null) as any,
        date: data.date ? new Date(data.date as any) : existing.date,
      })
      .where(
        and(
          eq(workTimeEntryTable.workTimeEntryId, entryId),
          eq(workTimeEntryTable.userId, userId),
        ),
      )
      .returning();

    if (!updated) {
      throw new AppError(500, "Failed to update work entry");
    }

    return {
      message: "Work entry updated successfully",
      workEntry: updated,
    };
  }

  static async importEntries(userId: string, entries: ImportWorkEntryBodyType[]) {
    const profile = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.userId, userId))
      .limit(1);

    if (!profile.length) {
      throw new AppError(
        404,
        "Profile not found. Please complete your profile setup before importing work entries.",
      );
    }

    return db.transaction(async (tx) => {
      for (const entry of entries) {
        await tx.insert(workTimeEntryTable).values({
          userId,
          date: new Date(entry.date),
          workingTime: entry.workingTime,
          category: entry.category as WorkTimeCategory,
          subcategory: (entry.subcategory ?? null) as any,
        });
      }
      return { message: "Import successful", count: entries.length };
    });
  }

  static async deleteEntry(userId: string, entryId: number) {
    // Verify ownership
    const [entry] = await db
      .select()
      .from(workTimeEntryTable)
      .where(
        and(
          eq(workTimeEntryTable.workTimeEntryId, entryId),
          eq(workTimeEntryTable.userId, userId),
        ),
      )
      .limit(1);

    if (!entry) {
      throw new AppError(
        404,
        "Work entry not found or you don't have permission to delete it",
      );
    }

    await db
      .delete(workTimeEntryTable)
      .where(
        and(
          eq(workTimeEntryTable.workTimeEntryId, entryId),
          eq(workTimeEntryTable.userId, userId),
        ),
      );

    return { message: "Work entry deleted successfully" };
  }
}
