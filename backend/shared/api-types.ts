import { GradeLevel } from "./enums";
import { ClassData, SpecialFunctionData } from "./types";

/**
 * Interfaces for profile API endpoints
 *
 */
export interface UpsertProfileRequestData {
  classData: ClassData;
  specialFunctionData: SpecialFunctionData;
}

export interface GetProfileResponse {
  message: string;
  profile: {
    classData: {
      classDataId: number;
      grade: string;
      givenLectures: number;
      mandatoryLectures: number;
      carryOverLectures: number;
    } | null;
    specialFunctionData: {
      specialFunctionId: number;
      headshipEmploymentFactor: number;
      carryOverLessons: number;
      classTeacher: boolean;
      weeklyLessonsForTransportation: number;
    } | null;
  };
}
