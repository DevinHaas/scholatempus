import { GradeLevel, WorkTimeCategory, WorkTimeSubCategory } from "~/shared";
import { InferSelectModel, relations } from "drizzle-orm";
import { boolean, text } from "drizzle-orm/pg-core";
import {
  char,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  smallint,
  timestamp,
} from "drizzle-orm/pg-core";

export const gradeLevelEnum = pgEnum(
  "grade",
  Object.values(GradeLevel) as [string, ...string[]],
);

export const workTimeCategoryEnum = pgEnum(
  "category",
  Object.keys(WorkTimeCategory) as [string, ...string[]]
);


export const workTimeSubCategories = pgEnum(
  "subcategory",
  Object.values(WorkTimeSubCategory) as [string, ...string[]]
);


export const profileTable = pgTable("profile", {
  userId: char({ length: 32 }).unique(),
  classDataId: integer("classDataId").references(
    () => classDataTable.classDataId,
    { onDelete: "cascade" },
  ),
  specialFunctionId: integer("specialFunctionId")
    .references(() => specialFunctionTable.specialFunctionId, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const profileRelations = relations(profileTable, ({ one, many }) => ({
  classData: one(classDataTable, {
    fields: [profileTable.classDataId],
    references: [classDataTable.classDataId],
  }),
  specialFunction: one(specialFunctionTable, {
    fields: [profileTable.specialFunctionId],
    references: [specialFunctionTable.specialFunctionId],
  }),
  workTimeEntries: many(workTimeEntryTable),
}));

export const classDataTable = pgTable("classData", {
  classDataId: serial("id").primaryKey(),
  grade: gradeLevelEnum("grade").notNull(),
  givenLectures: smallint().notNull(),
  mandatoryLectures: smallint().notNull(),
  carryOverLectures: smallint().notNull().default(0),
});

export const specialFunctionTable = pgTable("specialFunctionTable", {
  specialFunctionId: serial("id").primaryKey(),
  headshipEmploymentFactor: numeric("headshipEmploymentFactor", {
    mode: "number",
    precision: 3,
    scale: 2,
  }).notNull(),
  carryOverLessons: smallint("carryOverLessons").notNull().default(0),
  classTeacher: boolean("classTeacher").notNull().default(false),
  weeklyLessonsForTransportation: numeric("weeklyLessonsForTransportation", {
    mode: "number",
  })
    .notNull()
    .default(0),
});

export const workTimeEntryTable = pgTable("workTimeEntry", {
  workTimeEntryId: serial("id").primaryKey(),
  userId: char({ length: 32 })
    .notNull()
    .references(() => profileTable.userId, { onDelete: "cascade" }),
  date: timestamp().notNull(),
  workingTime: smallint().notNull(),
  category: workTimeCategoryEnum("category").notNull(),
  subcategory: workTimeSubCategories("subcategory"),
});

export const workTimeEntriesRelation = relations(
  workTimeEntryTable,
  ({ one }) => ({
    profile: one(profileTable, {
      fields: [workTimeEntryTable.userId],
      references: [profileTable.userId],
    }),
  }),
);
