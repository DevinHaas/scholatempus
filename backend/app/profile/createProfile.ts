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
import { CreateProfileRequestData } from "~/shared";

interface CreateProfileResponse {
  success: boolean;
  userId: string;
  message: string;
}

export const createProfile = api(
  {
    expose: true,
    path: "/profile",
    method: "POST",
    auth: true,
  },
  async (params: CreateProfileRequestData): Promise<CreateProfileResponse> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Not authenticated");
    }
    const userId = authData.userID;

    log.info("Creating profile", { userId });

    try {
      log.info("Input validation successful", { userId });

      // 3. Check if profile already exists
      const existingProfile = await db.query.profileTable.findFirst({
        where: eq(profileTable.userId, userId),
      });

      if (existingProfile) {
        log.warn("Profile already exists", { userId });
        throw APIError.alreadyExists(
          "Profile already exists for this user. Use PUT /profile to update.",
        );
      }

      const result = await db.transaction(async (tx) => {
        // 4a. Insert class data
        const [classDataRecord] = await tx
          .insert(classDataTable)
          .values({
            grade: params.classData.grade,
            givenLectures: params.classData.givenLectures,
            mandatoryLectures: params.classData.mandatoryLectures,
            carryOverLectures: params.classData.carryOverLectures,
          })
          .returning({ id: classDataTable.classDataId });

        log.info("Class data inserted", {
          userId,
          classDataId: classDataRecord.id,
        });

        // 4b. Insert special function data
        const [specialFunctionRecord] = await tx
          .insert(specialFunctionTable)
          .values({
            headshipEmploymentFactor:
              params.specialFunctionData.headshipEmploymentFactor,
            carryOverLessons: params.specialFunctionData.carryOverLessons,
            classTeacher: params.specialFunctionData.classTeacher,
            weeklyLessonsForTransportation:
              params.specialFunctionData.weeklyLessonsForTransportation,
          })
          .returning({ id: specialFunctionTable.specialFunctionId });

        log.info("Special function data inserted", {
          userId,
          specialFunctionId: specialFunctionRecord.id,
        });

        const [profileRecord] = await tx
          .insert(profileTable)
          .values({
            userId: userId,
            classDataId: classDataRecord.id,
            specialFunctionId: specialFunctionRecord.id,
          })
          .returning();

        log.info("Profile created successfully", { userId });

        return profileRecord;
      });

      return {
        success: true,
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
