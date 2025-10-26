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
import { ArrowLeft } from "lucide-react";
import {
  schulleitungSetupSchema,
  type SchulleitungSetupFormData,
} from "@/lib/validations";
import { number, z } from "zod";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import getNameFromEmailadress from "@/lib/helpers/getNameFromEmailadress";
import { log } from "console";

interface SchulleitungSetupScreenProps {
  onComplete: () => void;
  onBack: () => void;
  email: string;
}

export function SchulleitungSetupScreen({
  onComplete,
  onBack,
  email,
}: SchulleitungSetupScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      beschaeftigungsgrad: 0,
      uebertragSemester: 0,
      klassenlehrperson: false,
      wochenlektionenWegzeit: 0,
    },
    validators: {
      onSubmit: schulleitungSetupSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        console.log(value);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        onComplete();
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={onBack}
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
                  name="beschaeftigungsgrad"
                  children={(field) => {
                    const hasError = field.state.meta.errors.length > 0;

                    return (
                      <Field data-invalid={hasError}>
                        <FieldLabel
                          htmlFor="beschaeftigungsgrad"
                          className="text-sm font-medium"
                        >
                          Beschäftigungsgrad %
                        </FieldLabel>
                        <Input
                          id="beschaeftigungsgrad"
                          inputMode="numeric"
                          min="1"
                          max="100"
                          value={field.state.value}
                          placeholder="20%"
                          onChange={(event) =>
                            field.setValue(event.target.value)
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
                  name="uebertragSemester"
                  children={(field) => {
                    const hasError = field.state.meta.errors.length > 0;

                    return (
                      <Field data-invalid={hasError}>
                        <FieldLabel
                          htmlFor="uebertragSemester"
                          className="text-sm font-medium"
                        >
                          Übertrag letztes Semester
                        </FieldLabel>
                        <Input
                          id="uebertragSemester"
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={field.state.value}
                          onChange={(event) =>
                            field.setValue(event.target.value)
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
                  name="klassenlehrperson"
                  children={(field) => {
                    const hasError = field.state.meta.errors.length > 0;

                    return (
                      <Field
                        data-invalid={hasError}
                        orientation="horizontal"
                        className="items-center justify-between"
                      >
                        <FieldLabel
                          htmlFor="klassenlehrperson"
                          className="text-sm font-medium"
                        >
                          Klassenlehrperson
                        </FieldLabel>
                        <Switch
                          id="klassenlehrperson"
                          checked={field.state.value}
                          onCheckedChange={(checked) => field.setValue(checked)}
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
                  name="wochenlektionenWegzeit"
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
                            field.setValue(Number(value))
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
                  onClick={onBack}
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
