"use client";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateMandatoryLectures, getSchoolWeeks } from "@/lib/helpers/SetupCalculators";
import {
  useClassData,
  useProfileDataActions,
  useHydration,
} from "@/lib/stores/profileData";
import { classDataFormSchema, type SetupFormData } from "@/lib/validations";
import { useForm, useStore } from "@tanstack/react-form";
import { useMemo, useState } from "react";
import { Field, FieldError, FieldGroup, FieldLabel } from "../../../components/ui/field";
import { GRADE_LEVEL_LABELS, GradeLevel } from "@scholatempus/shared/enums";
import type { ClassData } from "@scholatempus/shared/schemas";
import { getGradeLevelFromLabel } from "@/lib/helpers/getGradeLevelFromLabel";
import { ClassDataSetupSkeleton } from "./classdata-skeleton";

interface SetupScreenProps {
  onCompleteAction: () => void;
  email?: string;
}

export function ClassDataSetupComponent({
  onCompleteAction,
}: SetupScreenProps) {
  const { updateClassData } = useProfileDataActions();
  const classData = useClassData();
  const hydrated = useHydration();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      grade:
        GRADE_LEVEL_LABELS[classData.grade] ??
        GRADE_LEVEL_LABELS.PRIMARY_SCHOOL_GYM,
      givenLectures: classData.givenLectures ?? 0,
      mandatoryLectures: classData.mandatoryLectures ?? 28,
      carryOverLectures: classData.carryOverLectures ?? 0,
    },
    validators: {
      onSubmit: classDataFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed: SetupFormData = classDataFormSchema.parse(value);
      const newClassData: ClassData = {
        grade: getGradeLevelFromLabel(parsed.grade),
        givenLectures: parsed.givenLectures,
        mandatoryLectures: parsed.mandatoryLectures,
        carryOverLectures: parsed.carryOverLectures,
      };
      updateClassData(newClassData);
      setIsLoading(true);
      try {
        onCompleteAction();
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const grade = useStore(form.store, (state) => state.values.grade);
  const selectedMandatoryLectures = useStore(form.store, (state) => state.values.mandatoryLectures);
  const mandatoryLectures = useMemo(
    () => calculateMandatoryLectures(getGradeLevelFromLabel(grade)),
    [grade],
  );
  const schoolWeeks = useMemo(
    () => getSchoolWeeks(getGradeLevelFromLabel(grade), selectedMandatoryLectures),
    [grade, selectedMandatoryLectures],
  );

  // Show skeleton while data is loading from localStorage
  if (!hydrated) {
    return <ClassDataSetupSkeleton />;
  }

  return (
    <div className="space-y-4">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Zeiterfassung Lehrperson</CardTitle>
            <CardDescription className="text-pretty">
              Gib die Daten deiner Klasse ein — wir berechnen daraus deine Sollarbeitszeit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <FieldGroup>
                <form.Field
                  name="grade"
                  listeners={{
                    onChange: ({ value, fieldApi }) => {
                      const options = calculateMandatoryLectures(
                        getGradeLevelFromLabel(value),
                      );
                      if (!options.length) return;

                      const nextMandatory = options[0];
                      fieldApi.form.setFieldValue(
                        "mandatoryLectures",
                        nextMandatory ?? 0,
                      );
                      fieldApi.form.setFieldValue(
                        "givenLectures",
                        (prev: number) => {
                          if (prev == null || prev === 0) return nextMandatory ?? 0;
                          return Math.min(prev, nextMandatory ?? 0);
                        },
                      );
                    },
                  }}
                  children={(field) => {
                    const hasError = field.state.meta.errors.length > 0;
                    return (
                      <Field data-invalid={hasError}>
                        <FieldLabel className="text-sm font-medium">
                          Stufe
                        </FieldLabel>
                        <Select
                          name={field.name}
                          value={field.state.value}
                          onValueChange={(newValue) =>
                            field.handleChange(newValue as GradeLevel)
                          }
                          aria-invalid={hasError}
                        >
                          <SelectTrigger
                            className={`h-11 ${hasError ? "border-destructive" : ""}`}
                          >
                            <SelectValue placeholder="Auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(GRADE_LEVEL_LABELS).map(
                              (gradeLable) => (
                                <SelectItem key={gradeLable} value={gradeLable}>
                                  {gradeLable}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        {hasError && (
                          <FieldError
                            errors={field.state.meta.errors}
                          ></FieldError>
                        )}
                      </Field>
                    );
                  }}
                />

                {/* Anzahl erteilte Lektionen */}
                <form.Field
                  name="givenLectures"
                  children={(field) => {
                    const hasError =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={hasError}>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm font-medium"
                        >
                          Anzahl erteilte Lektionen
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="z.B. 24"
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                          className={`h-11 ${hasError ? "border-destructive" : ""}`}
                          min="0"
                          max="50"
                          aria-invalid={hasError}
                        />
                        {hasError && (
                          <FieldError
                            errors={field.state.meta.errors}
                          ></FieldError>
                        )}
                      </Field>
                    );
                  }}
                />

                {/* Mandatory Lectures */}
                <form.Field
                  name="mandatoryLectures"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-center justify-between">
                          <FieldLabel
                            htmlFor={field.name}
                            className="text-sm font-medium"
                          >
                            Pflichtlektionen
                          </FieldLabel>
                          <span className="text-xs text-muted-foreground">{schoolWeeks} Schulwochen</span>
                        </div>
                        <Select
                          name={field.name}
                          value={String(field.state.value ?? "")}
                          onValueChange={(val) => {
                            if (!val) return;
                            const next = Number(val);
                            if (!Number.isFinite(next)) return;
                            field.handleChange(next);
                          }}
                          aria-invalid={isInvalid}
                        >
                          <SelectTrigger className={`h-11 `}>
                            <SelectValue placeholder="Auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {mandatoryLectures.map((mandatoryLecture) => (
                              <SelectItem
                                key={mandatoryLecture}
                                value={mandatoryLecture.toString()}
                              >
                                {mandatoryLecture}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError
                            errors={field.state.meta.errors}
                          ></FieldError>
                        )}
                      </Field>
                    );
                  }}
                />

                {/* Carry Over Lectures */}

                <form.Field
                  name="carryOverLectures"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field className="space-y-2">
                        <FieldLabel className="text-sm font-medium">
                          Übertrag letztes Semester
                        </FieldLabel>
                        <Input
                          id="uebertragSemester"
                          placeholder="z.B. 15"
                          value={field.state.value}
                          onChange={(event) =>
                            field.handleChange(Number(event.target.value) || 0)
                          }
                          aria-invalid={isInvalid}
                          className={`h-11`}
                          min="0"
                        />
                        {isInvalid && (
                          <FieldError
                            errors={field.state.meta.errors}
                          ></FieldError>
                        )}
                      </Field>
                    );
                  }}
                />
              </FieldGroup>
              {/* Stufe */}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-8"
              >
                {isLoading ? "Wird gespeichert..." : "Weiter"}
              </Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );
}
