CREATE TYPE "public"."subcategory" AS ENUM('class', 'preperation', 'supporting');--> statement-breakpoint
ALTER TABLE "workTimeEntry" ADD COLUMN "subcategory" "subcategory";