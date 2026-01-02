import { z } from "zod";

import {
  ClassDataSchema,
  GRADE_LEVEL_LABELS,
  SpecialFunctionDataSchema,
  WeeklyLessonsForTransportationSchema,
} from "@scholatempus/shared";

export const classDataFormSchema = ClassDataSchema.extend({
  grade: z.enum(Object.values(GRADE_LEVEL_LABELS) as [string, ...string[]]),
  givenLectures: z.coerce
    .number()
    .min(1, "Erteilte Lektionen können nicht 0 sein"),
  mandatoryLectures: z.coerce
    .number()
    .min(1, "Pflichtlektionen können nicht 0 sein"),
  carryOverLectures: z.coerce.number().min(0),
}).superRefine((data, ctx) => {
  if (data.givenLectures > data.mandatoryLectures) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Erteilte Lektionen sollten kleiner oder gleich der Pflichtlektionen sein",
      path: ["givenLectures"],
    });
  }
});

export const schulleitungSetupFormSchema = SpecialFunctionDataSchema.extend({
  headshipEmploymentFactor: z.coerce
    .number()
    .min(0, "Beschäftigungsgrad kann nicht negativ sein")
    .max(100, "Beschäftigungsgrad muss zwischen 0 und 100% liegen"),
  carryOverLessons: z.coerce
    .number()
    .min(0, "Übertrag kann nicht negativ sein"),
  weeklyLessonsForTransportation: z.coerce
    .number()
    .pipe(WeeklyLessonsForTransportationSchema),
});

export type SetupFormData = z.infer<typeof classDataFormSchema>;
export type SchulleitungSetupFormData = z.infer<
  typeof schulleitungSetupFormSchema
>;
