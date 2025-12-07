import { InferSelectModel } from "drizzle-orm";
import { GradeLevel } from "./enums";
import { profileTable } from "../db/schema";

// TypeScript type definitions matching the Zod schemas
// These are manually maintained to match schemas.ts

export type WeeklyLessonsForTransportation = 0 | 0.5 | 1 | 1.5 | 2;

export interface ClassData {
  grade: GradeLevel;
  givenLectures: number;
  mandatoryLectures: number;
  carryOverLectures: number;
}

export interface SpecialFunctionData {
  headshipEmploymentFactor: number;
  carryOverLessons: number;
  classTeacher: boolean;
  weeklyLessonsForTransportation: number;
}

export interface ProfileData {
  classData: ClassData;
  specialFunctionData: SpecialFunctionData;
}

export type ProfileSelect = InferSelectModel<typeof profileTable>;
