ALTER TABLE "profile" DROP CONSTRAINT "profile_classDataId_classData_id_fk";
--> statement-breakpoint
ALTER TABLE "profile" DROP CONSTRAINT "profile_specialFunctionId_specialFunctionTable_id_fk";
--> statement-breakpoint
ALTER TABLE "workTimeEntry" DROP CONSTRAINT "workTimeEntry_userId_profile_userId_fk";
--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_classDataId_classData_id_fk" FOREIGN KEY ("classDataId") REFERENCES "public"."classData"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_specialFunctionId_specialFunctionTable_id_fk" FOREIGN KEY ("specialFunctionId") REFERENCES "public"."specialFunctionTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workTimeEntry" ADD CONSTRAINT "workTimeEntry_userId_profile_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."profile"("userId") ON DELETE cascade ON UPDATE no action;