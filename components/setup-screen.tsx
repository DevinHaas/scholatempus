"use client";

import type React from "react";

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
import { GradeLevel } from "@/lib/enums/grade";
import { calculateMandatoryLectures } from "@/lib/helpers/OverviewDataCalculators";
import { ClassData, useProfileDataActions } from "@/lib/stores/profileData";
import { useForm, useStore } from "@tanstack/react-form";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { log } from "console";
import { useUser } from "@clerk/nextjs";
import getNameFromEmailadress from "@/lib/helpers/getNameFromEmailadress";

interface SetupScreenProps {
  onComplete: () => void;
  email: string;
}

const GradeLevelSchema = z.nativeEnum(GradeLevel);

const formSchema = z
  .object({
    grade: GradeLevelSchema,
    givenLectures: z.number().min(1, "Erteilte Lektionen können nicht 0 sein"),
    mandatoryLectures: z
      .number()
      .min(1, "Pflichtlektionen können nicht 0 sein"),
    carryOverLectures: z.number(),
  })
  .refine((data) => data.givenLectures <= data.mandatoryLectures, {
    message: "given lectures cannot be greater than mandatory lectures",
    path: ["givenLectures"],
  });

export function SetupScreen({ onComplete, email }: SetupScreenProps) {
  const { updateClassData } = useProfileDataActions();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      grade: GradeLevel.PrimarySchoolGymnasiumEntry,
      givenLectures: 0,
      mandatoryLectures: 28,
      carryOverLectures: 0,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);

      setIsLoading(true);
      try {
        onComplete();
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const grade = useStore(form.store, (state) => state.values.grade);
  const mandatoryLectures = useMemo(
    () => calculateMandatoryLectures(grade),
    [grade],
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Einrichtung
            </h1>
            <p className="text-sm text-muted-foreground">
              Willkommen, {getNameFromEmailadress(email)}
            </p>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Zeiterfassung Lehrperson</CardTitle>
            <CardDescription className="text-pretty">
              Hier werden die Daten für die Berechnung der Arbeitszeit
              eingegeben
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
                    onChange: ({ value }) => {
                      const newMandatoryLectures =
                        calculateMandatoryLectures(value);

                      if (!newMandatoryLectures.length) return;

                      form.setFieldValue(
                        "mandatoryLectures",
                        newMandatoryLectures[0],
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
                            {Object.values(GradeLevel).map((grade) => (
                              <SelectItem key={grade} value={grade}>
                                {grade}
                              </SelectItem>
                            ))}
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
                          placeholder="z.B. 24"
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(parseInt(e.target.value))
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
                  validators={{
                    onChangeListenTo: ["grade"],
                    onChange: ({ value, fieldApi }) => {
                      console.log("grade changed");
                      console.log("currentValue", value);
                    },
                  }}
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm font-medium"
                        >
                          Pflichtlektionen
                        </FieldLabel>
                        <Select
                          name={field.name}
                          value={field.state.value.toString()}
                          onValueChange={() => field.handleChange}
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
                          <div>
                            {field.state.value}
                            <FieldError
                              errors={field.state.meta.errors}
                            ></FieldError>
                          </div>
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
                          onChange={(value) =>
                            field.setValue(parseInt(value.target.value) || 0)
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

        <div className="text-center text-xs text-muted-foreground">
          Diese Einstellungen können später in den Profileinstellungen geändert
          werden.
        </div>
      </div>
    </div>
  );
}
