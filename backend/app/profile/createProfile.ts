import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../../db/index.js";
import {
  profileTable,
  classDataTable,
  specialFunctionTable,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";
import log from "encore.dev/log";
import { UpsertProfileRequestData } from "~/shared";

interface UpsertProfileResponse {
  userId: string;
  message: string;
}

export const upsertProfile = api(
  {
    expose: true,
    path: "/profile",
    method: "PUT",
    auth: true,
  },
  async (params: UpsertProfileRequestData): Promise<UpsertProfileResponse> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Not authenticated");
    }
    const userId = authData.userID;

    log.info("Creating profile", { userId });

    try {
      log.info("Input validation successful", { userId });

      const result = await db.transaction(async (tx) => {
        // 4a. Insert class data
        const [newClassDataRecord] = await tx
          .insert(classDataTable)
          .values({
            grade: params.classData.grade,
            givenLectures: params.classData.givenLectures,
            mandatoryLectures: params.classData.mandatoryLectures,
            carryOverLectures: params.classData.carryOverLectures,
          })
          .onConflictDoUpdate({
            target: classDataTable.classDataId,
            set: params.classData,
          })
          .returning({ id: classDataTable.classDataId });

        log.info("Class data updated", {
          userId,
          classDataId: newClassDataRecord.id,
        });

        // 4b. Insert special function data
        const [newSpecialFunctionRecord] = await tx
          .insert(specialFunctionTable)
          .values({
            headshipEmploymentFactor:
              params.specialFunctionData.headshipEmploymentFactor,
            carryOverLessons: params.specialFunctionData.carryOverLessons,
            classTeacher: params.specialFunctionData.classTeacher,
            weeklyLessonsForTransportation:
              params.specialFunctionData.weeklyLessonsForTransportation,
          })
          .onConflictDoUpdate({
            target: specialFunctionTable.specialFunctionId,
            set: params.specialFunctionData,
          })
          .returning({ id: specialFunctionTable.specialFunctionId });

        log.info("Special function data upserted", {
          userId,
          specialFunctionId: newSpecialFunctionRecord.id,
        });

        const [profileRecord] = await tx
          .insert(profileTable)
          .values({
            userId: userId,
            classDataId: newClassDataRecord.id,
            specialFunctionId: newSpecialFunctionRecord.id,
          })
          .onConflictDoUpdate({
            target: profileTable.userId,
            set: {
              classDataId: newClassDataRecord.id,
              specialFunctionId: newSpecialFunctionRecord.id,
            },
          })
          .returning();

        log.info("Profile upserted successfully", { userId });

        return profileRecord;
      });

      return {
        userId: result.userId!,
        message: "Profile created successfully",
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      log.error("Failed to create profile", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw APIError.internal(
        "Failed to create profile. Please try again.",
        error as Error,
      );
    }
  },
);
