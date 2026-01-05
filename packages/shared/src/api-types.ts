import type { ClassData, SpecialFunctionData } from "./types";

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

export interface WorkEntry {
  category: string;
  subcategory: string | undefined;
  workingTime: number;
  isManually?: boolean;
}

export interface AddWorkEntriesRequest {
  entries: WorkEntry[];
}

export interface AddWorkEntriesResponse {
  message: string;
  count: number;
}

export interface CheckProfileExistsResponse {
  exists: boolean;
}

export interface GetWorkEntriesResponse {
  message: string;
  workEntries: Array<{
    workTimeEntryId: number;
    userId: string;
    date: Date;
    workingTime: number;
    category: string;
    subcategory: string | null;
  }>;
}

export interface UpdateWorkEntryRequest {
  category: string;
  subcategory: string | undefined;
  workingTime: number;
  date?: Date;
}

export interface UpdateWorkEntryResponse {
  message: string;
  workEntry: {
    workTimeEntryId: number;
    userId: string;
    date: Date;
    workingTime: number;
    category: string;
    subcategory: string | null;
    isManually: boolean;
  };
}

export interface DeleteWorkEntryResponse {
  message: string;
}
