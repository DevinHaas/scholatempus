import {
  char,
  integer,
  pgEnum,
  pgTable,
  serial,
  smallint,
} from "drizzle-orm/pg-core";

export enum WorkTimeCategory {
  SchoolManagement = "Schulleitung",
  TeachingAdvisingSupporting = "Unterrichten, beraten, begleiten",
  Collaboration = "Zusammenarbeit",
  FurtherEducation = "Weiterbildung",
  TeachingSupervision = "Unterrichtskontrolle",
}

export const profileTable = pgTable("profile", {
  //for connecting to clerk userId example: user_34Ze61uriJSDVopgKl5QJgUtw4E
  userId: char({ length: 32 }),
  classDataId: integer("classDataId").references(() => classDataTable.id),
  specialFunctionId: integer("specialFunctionId").references(
    () => specialFunctionTable.id,
  ),
});

export const gradeLevelEnum = pgEnum("grade_level", [
  "Volksschule (inkl. Erstes Jahr des gymnasialen Bildungsganges)",
  "Berufsvorbereitendes Schuljahr, Vorlehren (theoretischer und praktischer* Unterricht)",
  "Berufsvorbereitendes Schuljahr (praktischer* Unterricht)",
  "Handelsmittelschule, Lehrwerkstätte (theoretischer Unterricht), Berufsschule inkl. Berufliche Weiterbildung",
  "Berufsmaturitätsschule, Fachmittelschule, Berufsmaturitätsunterricht an Handelsmittelschulen",
  "Gymnasium (10.-12. Schuljahr bzw. 12. – 14. Schuljahr gemäss Harmos)",
]);

export const classDataTable = pgTable("classData", {
  id: serial("id").primaryKey(),
  grade: gradeLevelEnum("grade").notNull(),
  givenLectures: smallint().notNull(),
  mandatoryLectures: smallint().notNull(),
  carryOverLectures: smallint().notNull().default(0),
});

export const specialFunctionTable = pgTable("specialFunctionTable", {
  id: serial("id").primaryKey(),
  headshipEmploymentFactor: char({ length: 10 }),
  carryOverLessons: char({ length: 10 }),
  classTeacher: char({ length: 10 }),
  weeklyLessonsForTransportation: char({ length: 10 }),
});

export const workTimeOverviewTable = pgTable("workTimeOverviewTable", {
  id: serial("id").primaryKey(),
  detailId: char({ length: 10 }),
  summaryId: char({ length: 10 }),
});
