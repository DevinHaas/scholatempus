import { z } from "zod";
import { GradeLevel } from "@/lib/enums/grade";

const allowedWeeklyLessons = [0, 0.5, 1, 1.5, 2] as const;

export const WeeklyLessonsForTransportationSchema = z
  .number()
  .refine((val) => allowedWeeklyLessons.includes(val as any), {
    message: "Ungültige Anzahl Wochenlektionen",
  });

export const ClassDataSchema = z.object({
  grade: z.nativeEnum(GradeLevel),
  givenLectures: z.number().min(0),
  mandatoryLectures: z.number().min(0),
  carryOverLectures: z.number().min(0),
});

export const SpecialFunctionDataSchema = z.object({
  headshipEmploymentFactor: z.number().min(0).max(100),
  carryOverLessons: z.number().min(0),
  classTeacher: z.boolean(),
  weeklyLessonsForTransportation: WeeklyLessonsForTransportationSchema,
});

export const ProfileDataSchema = z.object({
  classData: ClassDataSchema,
  specialFunctionData: SpecialFunctionDataSchema,
});

export type WeeklyLessonsForTransportation = z.infer<
  typeof WeeklyLessonsForTransportationSchema
>;
export type ClassData = z.infer<typeof ClassDataSchema>;
export type SpecialFunctionData = z.infer<typeof SpecialFunctionDataSchema>;
export type ProfileData = z.infer<typeof ProfileDataSchema>;
