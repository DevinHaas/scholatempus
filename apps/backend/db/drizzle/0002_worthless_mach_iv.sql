ALTER TABLE "workTimeEntry" ALTER COLUMN "subcategory" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."subcategory";--> statement-breakpoint
CREATE TYPE "public"."subcategory" AS ENUM('Class', 'Preparation', 'Supporting');--> statement-breakpoint
ALTER TABLE "workTimeEntry" ALTER COLUMN "subcategory" SET DATA TYPE "public"."subcategory" USING "subcategory"::"public"."subcategory";--> statement-breakpoint
ALTER TABLE "workTimeEntry" DROP COLUMN "isManually";