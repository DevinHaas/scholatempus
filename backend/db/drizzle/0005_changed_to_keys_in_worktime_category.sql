ALTER TABLE "workTimeEntry" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."category";--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('SchoolManagement', 'TeachingAdvisingSupporting', 'Collaboration', 'FurtherEducation', 'TeachingSupervision');--> statement-breakpoint
ALTER TABLE "workTimeEntry" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::"public"."category";