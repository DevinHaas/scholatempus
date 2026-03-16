import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  profileTable,
  classDataTable,
  specialFunctionTable,
} from "../../../db/schema.js";
import { AppError } from "../../lib/errors.js";
import type { UpsertProfileBodyType } from "./model.js";

// userId is injected by the requireAuth macro's resolve handler

export class ProfileService {
  static async checkExists(userId: string) {
    const profile = await db
      .select({ userId: profileTable.userId })
      .from(profileTable)
      .where(eq(profileTable.userId, userId))
      .limit(1);

    return { exists: profile.length > 0 };
  }

  static async getProfile(userId: string) {
    const rows = await db
      .select({
        classData: classDataTable,
        specialFunctionData: specialFunctionTable,
      })
      .from(profileTable)
      .where(eq(profileTable.userId, userId))
      .leftJoin(
        classDataTable,
        eq(profileTable.classDataId, classDataTable.classDataId),
      )
      .leftJoin(
        specialFunctionTable,
        eq(
          profileTable.specialFunctionId,
          specialFunctionTable.specialFunctionId,
        ),
      )
      .limit(1);

    if (!rows.length) {
      throw new AppError(404, "Profile not found");
    }

    return { message: "good", profile: rows[0]! };
  }

  static async upsertProfile(userId: string, data: UpsertProfileBodyType) {
    const result = await db.transaction(async (tx) => {
      const [newClassData] = await tx
        .insert(classDataTable)
        .values({
          grade: data.classData.grade as any,
          givenLectures: data.classData.givenLectures,
          mandatoryLectures: data.classData.mandatoryLectures,
          carryOverLectures: data.classData.carryOverLectures,
        })
        .onConflictDoUpdate({
          target: classDataTable.classDataId,
          set: {
            grade: data.classData.grade as any,
            givenLectures: data.classData.givenLectures,
            mandatoryLectures: data.classData.mandatoryLectures,
            carryOverLectures: data.classData.carryOverLectures,
          },
        })
        .returning({ id: classDataTable.classDataId });

      const [newSpecialFunction] = await tx
        .insert(specialFunctionTable)
        .values({
          headshipEmploymentFactor: Number(
            data.specialFunctionData.headshipEmploymentFactor,
          ),
          carryOverLessons: data.specialFunctionData.carryOverLessons,
          classTeacher: data.specialFunctionData.classTeacher,
          weeklyLessonsForTransportation: Number(
            data.specialFunctionData.weeklyLessonsForTransportation,
          ),
        })
        .onConflictDoUpdate({
          target: specialFunctionTable.specialFunctionId,
          set: {
            headshipEmploymentFactor: Number(
              data.specialFunctionData.headshipEmploymentFactor,
            ),
            carryOverLessons: data.specialFunctionData.carryOverLessons,
            classTeacher: data.specialFunctionData.classTeacher,
            weeklyLessonsForTransportation: Number(
              data.specialFunctionData.weeklyLessonsForTransportation,
            ),
          },
        })
        .returning({ id: specialFunctionTable.specialFunctionId });

      const [profileRecord] = await tx
        .insert(profileTable)
        .values({
          userId,
          classDataId: newClassData!.id,
          specialFunctionId: newSpecialFunction!.id,
        })
        .onConflictDoUpdate({
          target: profileTable.userId,
          set: {
            classDataId: newClassData!.id,
            specialFunctionId: newSpecialFunction!.id,
          },
        })
        .returning();

      return profileRecord;
    });

    return { userId: result!.userId!, message: "Profile created successfully" };
  }
}
