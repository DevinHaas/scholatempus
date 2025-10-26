import { z } from "zod";

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-Mail ist erforderlich")
    .email("Ungültige E-Mail-Adresse"),
  password: z
    .string()
    .min(1, "Passwort ist erforderlich")
    .min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
});

// Setup form validation schema
export const setupSchema = z.object({
  stufe: z.string().min(1, "Bitte wählen Sie eine Stufe aus"),
  anzahlLektionen: z
    .string()
    .min(1, "Anzahl Lektionen ist erforderlich")
    .refine((val) => {
      const num = Number.parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 50;
    }, "Anzahl muss zwischen 1 und 50 liegen"),
  pflichtlektionen: z
    .string()
    .min(1, "Bitte wählen Sie die Pflichtlektionen aus"),
  uebertragSemester: z
    .string()
    .min(1, "Übertrag ist erforderlich")
    .refine((val) => {
      const num = Number.parseInt(val);
      return !isNaN(num) && num >= 0;
    }, "Übertrag muss eine positive Zahl sein"),
});

export const schulleitungSetupSchema = z.object({
  beschaeftigungsgrad: z
    .number()
    .min(1, "Beschäftigungsgrad ist erforderlich")
    .refine((val) => {
      return !isNaN(val) && val >= 1 && val <= 100;
    }, "Beschäftigungsgrad muss zwischen 1 und 100% liegen"),
  uebertragSemester: z
    .number()
    .min(0, "Übertrag kann nicht negativ sein")
    .refine((val) => {
      return !isNaN(val) && val >= 0;
    }, "Übertrag muss eine positive Zahl sein"),
  klassenlehrperson: z.boolean(),
  wochenlektionenWegzeit: z
    .number()
    .min(0, "Wochenlektionen-Wegzeit kann nicht negativ sein"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SetupFormData = z.infer<typeof setupSchema>;
export type SchulleitungSetupFormData = z.infer<typeof schulleitungSetupSchema>;
