import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../../db";
import {
  classDataTable,
  profileTable,
  specialFunctionTable,
} from "../../db/schema";
import { eq } from "drizzle-orm";
import { GetProfileResponse } from "@scholatempus/shared";

export const getProfile = api(
  {
    auth: true,
    method: "GET",
    path: "/profile",
  },
  async (): Promise<GetProfileResponse> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Not authenticated");
    }
    const userId = authData.userID;
    console.log(userId);

    try {
      let profile = await db
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

      console.log("Raw profile result:", profile);

      if (!profile || profile.length === 0) {
        console.log("no profile found");
        throw APIError.notFound("no profile found");
      }

      console.log("Returning profile:", profile[0]);

      return {
        message: "good",
        profile: profile[0],
      };
    } catch (e) {
      console.error("Database error:", e);
      throw APIError.internal("could not fetch profile data");
    }
  },
);
