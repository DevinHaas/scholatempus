"use client";

import type React from "react";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import {
  schulleitungSetupFormSchema,
  type SchulleitungSetupFormData,
} from "@/lib/validations";
import {
  useProfileDataActions,
  useSpecialFunctionData,
  useHydration,
} from "@/lib/stores/profileData";
import type { WeeklyLessonsForTransportation } from "scholatempus-backend/shared";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import getNameFromEmailadress from "@/lib/helpers/getNameFromEmailadress";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";

interface SchulleitungSetupScreenProps {
  onCompleteAction: () => void;
  onBackAction: () => void;
  email: string;
}

// Skeleton component for loading state
function SchulleitungSetupSkeleton({
  onBackAction,
}: {
  onBackAction: () => void;
}) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={onBackAction}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Skeleton className="h-7 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Form fields skeleton */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>

              {/* Buttons skeleton */}
              <div className="flex gap-3 pt-4">
                <Skeleton className="flex-1 h-11" />
                <Skeleton className="flex-1 h-11" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Skeleton className="h-3 w-72 mx-auto" />
      </div>
    </div>
  );
}

export function SchulleitungSetupComponent({
  onCompleteAction,
  onBackAction,
  email,
}: SchulleitungSetupScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const hydrated = useHydration();

  const { updateSpecialFunctionData } = useProfileDataActions();

  const specialFunctionData = useSpecialFunctionData();

  const form = useForm({
    defaultValues: {
      headshipEmploymentFactor:
        specialFunctionData.headshipEmploymentFactor ?? 0,
      carryOverLessons: specialFunctionData.carryOverLessons ?? 0,
      classTeacher: specialFunctionData.classTeacher ?? false,
      weeklyLessonsForTransportation:
        specialFunctionData.weeklyLessonsForTransportation ??
        (0 as WeeklyLessonsForTransportation),
    },
    validators: {
      onSubmit: schulleitungSetupFormSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        const parsed: SchulleitungSetupFormData =
          schulleitungSetupFormSchema.parse(value);
        updateSpecialFunctionData(parsed);

        onCompleteAction();
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation failed:", error.flatten().fieldErrors);
        } else {
          console.error("Schulleitung setup submission failed:", error);
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Show skeleton while data is loading from localStorage
  if (!hydrated) {
    return <SchulleitungSetupSkeleton onBackAction={onBackAction} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={onBackAction}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
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
            <CardTitle className="text-lg">
              Zeiterfassung Schulleitung/Spezialfunktion
            </CardTitle>
            <CardDescription className="text-pretty">
              Hier werden die Daten für die Berechnung der Arbeitszeit
              eingegeben
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <FieldGroup>
                <form.Field
                  name="headshipEmploymentFactor"
                  children={(field) => {
                    const hasError = field.state.meta.errors.length > 0;

                    return (
                      <Field data-invalid={hasError}>
                        <FieldLabel
                          htmlFor="headshipEmploymentFactor"
                          className="text-sm font-medium"
                        >
                          Beschäftigungsgrad Schulleitung %
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id="headshipEmploymentFactor"
                            inputMode="numeric"
                            min="1"
                            max="100"
                            value={String(field.state.value ?? "")}
                            placeholder="20%"
                            onChange={(event) =>
                              field.handleChange(Number(event.target.value))
                            }
                            className={`h-11 border-amber-100 ${hasError ? "border-destructive" : ""}`}
                            aria-invalid={hasError}
                          />
                          <InputGroupAddon align="inline-end">
                            <span>%</span>
                          </InputGroupAddon>
                        </InputGroup>
                        {hasError && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="carryOverLessons"
                  children={(field) => {
                    const hasError = field.state.meta.errors.length > 0;

                    return (
                      <Field data-invalid={hasError}>
                        <FieldLabel
                          htmlFor="carryOverLessons"
                          className="text-sm font-medium"
                        >
                          Übertrag letztes Semester
                        </FieldLabel>
                        <Input
                          id="carryOverLessons"
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={String(field.state.value ?? "")}
                          onChange={(event) =>
                            field.handleChange(Number(event.target.value))
                          }
                          className={`h-11 ${hasError ? "border-destructive" : ""}`}
                          aria-invalid={hasError}
                        />
                        {hasError && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="classTeacher"
                  children={(field) => {
                    const hasError = field.state.meta.errors.length > 0;

                    return (
                      <Field
                        data-invalid={hasError}
                        orientation="horizontal"
                        className="items-center justify-between"
                      >
                        <FieldLabel
                          htmlFor="classTeacher"
                          className="text-sm font-medium"
                        >
                          Klassenlehrperson
                        </FieldLabel>
                        <Switch
                          id="classTeacher"
                          checked={Boolean(field.state.value)}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked)
                          }
                          aria-invalid={hasError}
                        />
                        {hasError && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="weeklyLessonsForTransportation"
                  children={(field) => {
                    const hasError = field.state.meta.errors.length > 0;

                    return (
                      <Field data-invalid={hasError}>
                        <FieldLabel className="text-sm font-medium">
                          Anzahl Wochenlektionen für Wegzeit
                        </FieldLabel>
                        <Select
                          name={field.name}
                          value={field.state.value.toString()}
                          onValueChange={(value) =>
                            field.handleChange(
                              Number(value) as WeeklyLessonsForTransportation,
                            )
                          }
                          aria-invalid={hasError}
                        >
                          <SelectTrigger
                            className={`h-11 ${hasError ? "border-destructive" : ""}`}
                          >
                            <SelectValue placeholder="Auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0 Lektionen</SelectItem>
                            <SelectItem value="0.5">0.5 Lektionen</SelectItem>
                            <SelectItem value="1">1 Lektionen</SelectItem>
                            <SelectItem value="1.5">1.5 Lektionen</SelectItem>
                            <SelectItem value="2">2 Lektionen</SelectItem>
                          </SelectContent>
                        </Select>
                        {hasError && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </FieldGroup>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 bg-transparent"
                  onClick={onBackAction}
                  disabled={isLoading}
                >
                  Zurück
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11"
                  disabled={isLoading}
                >
                  {isLoading ? "Wird gespeichert..." : "Weiter"}
                </Button>
              </div>
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
