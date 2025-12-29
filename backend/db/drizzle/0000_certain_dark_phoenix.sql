CREATE TYPE "public"."grade" AS ENUM('PRIMARY_SCHOOL_GYM', 'VOC_PREP_FULL', 'VOC_PREP_PRACT', 'COMM_MID_VOC_EXT', 'VOC_BACC_SPEC', 'GYMNASIUM_ACADEMIC');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('SchoolManagement', 'TeachingAdvisingSupporting', 'Collaboration', 'FurtherEducation', 'TeachingSupervision');--> statement-breakpoint
CREATE TYPE "public"."subcategory" AS ENUM('class', 'preperation', 'supporting');--> statement-breakpoint
CREATE TABLE "classData" (
	"id" serial PRIMARY KEY NOT NULL,
	"grade" "grade" NOT NULL,
	"givenLectures" smallint NOT NULL,
	"mandatoryLectures" smallint NOT NULL,
	"carryOverLectures" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"userId" char(32),
	"classDataId" integer,
	"specialFunctionId" integer NOT NULL,
	CONSTRAINT "profile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "specialFunctionTable" (
	"id" serial PRIMARY KEY NOT NULL,
	"headshipEmploymentFactor" numeric(3, 2) NOT NULL,
	"carryOverLessons" smallint DEFAULT 0 NOT NULL,
	"classTeacher" boolean DEFAULT false NOT NULL,
	"weeklyLessonsForTransportation" numeric DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workTimeEntry" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" char(32) NOT NULL,
	"date" timestamp NOT NULL,
	"workingTime" smallint NOT NULL,
	"category" "category" NOT NULL,
	"subcategory" "subcategory"
);
--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_classDataId_classData_id_fk" FOREIGN KEY ("classDataId") REFERENCES "public"."classData"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_specialFunctionId_specialFunctionTable_id_fk" FOREIGN KEY ("specialFunctionId") REFERENCES "public"."specialFunctionTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workTimeEntry" ADD CONSTRAINT "workTimeEntry_userId_profile_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."profile"("userId") ON DELETE cascade ON UPDATE no action;