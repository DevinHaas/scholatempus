import { z } from "zod";
import { GradeLevel, WorkTimeCategory, WorkTimeSubCategory } from "./enums";

const allowedWeeklyLessons = [0, 0.5, 1, 1.5, 2] as const;

export const WeeklyLessonsForTransportationSchema = z
  .number()
  .refine((val) => allowedWeeklyLessons.includes(val as any), {
    message: "Ungültige Anzahl Wochenlektionen",
  });



  export const TimeEntryZodSchema = z.object({
    workingTime: z.number(),
    category: z.enum(Object.keys(WorkTimeCategory) as [string, ...string[]], {
      message: "Please select a category",
    }),
    subcategory: z
      .enum(Object.values(WorkTimeSubCategory) as [string, ...string[]], {
        message:
          "Please select a subcategory for the category Unterrichten, beraten, begleiten",
      })
      .optional(),
  });
  
  export type TimeEntry = z.infer<typeof TimeEntryZodSchema>;

export const ClassDataSchema = z.object({
  grade: z.nativeEnum(GradeLevel),
  givenLectures: z.number().int().min(0).max(50),
  mandatoryLectures: z.number().int().min(0).max(50),
  carryOverLectures: z.number().int().min(0),
});

export const SpecialFunctionDataSchema = z.object({
  headshipEmploymentFactor: z.number().min(0).max(100),
  carryOverLessons: z.number().int().min(0),
  classTeacher: z.boolean(),
  weeklyLessonsForTransportation: WeeklyLessonsForTransportationSchema,
});

export const ProfileDataSchema = z.object({
  classData: ClassDataSchema,
  specialFunctionData: SpecialFunctionDataSchema,
});
