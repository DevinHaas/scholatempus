"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  schulleitungSetupFormSchema,
  type SchulleitungSetupFormData,
} from "@/lib/validations";
import type { WeeklyLessonsForTransportation } from "@scholatempus/shared";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { SpecialFunctionData } from "@scholatempus/shared";
import { useStore } from "@tanstack/react-form";

interface SpecialFunctionDataFormProps {
  defaultValues?: {
    headshipEmploymentFactor?: number;
    carryOverLessons?: number;
    classTeacher?: boolean;
    weeklyLessonsForTransportation?: number;
  };
  onSubmit: (data: SpecialFunctionData) => void | Promise<void>;
  onValuesChange?: (data: SpecialFunctionData) => void;
  isLoading?: boolean;
  className?: string;
}

export function SpecialFunctionDataForm({
  defaultValues,
  onSubmit,
  onValuesChange,
  isLoading = false,
  className = "",
}: SpecialFunctionDataFormProps) {
  const form = useForm({
    defaultValues: {
      headshipEmploymentFactor: defaultValues?.headshipEmploymentFactor ?? 0,
      carryOverLessons: defaultValues?.carryOverLessons ?? 0,
      classTeacher: defaultValues?.classTeacher ?? false,
      weeklyLessonsForTransportation:
        (defaultValues?.weeklyLessonsForTransportation ?? 0) as WeeklyLessonsForTransportation,
    },
    validators: {
      onSubmit: schulleitungSetupFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const parsed: SchulleitungSetupFormData =
          schulleitungSetupFormSchema.parse(value);
        const specialFunctionData: SpecialFunctionData = {
          headshipEmploymentFactor: parsed.headshipEmploymentFactor,
          carryOverLessons: parsed.carryOverLessons,
          classTeacher: parsed.classTeacher,
          weeklyLessonsForTransportation: parsed.weeklyLessonsForTransportation,
        };
        await onSubmit(specialFunctionData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation failed:", error.flatten().fieldErrors);
        } else {
          console.error("Schulleitung setup submission failed:", error);
        }
      }
    },
  });

  const headshipEmploymentFactor = useStore(form.store, (state) => state.values.headshipEmploymentFactor);
  const carryOverLessons = useStore(form.store, (state) => state.values.carryOverLessons);
  const classTeacher = useStore(form.store, (state) => state.values.classTeacher);
  const weeklyLessonsForTransportation = useStore(form.store, (state) => state.values.weeklyLessonsForTransportation);

  // Store callback in ref to avoid infinite loops
  const onValuesChangeRef = useRef(onValuesChange);
  useEffect(() => {
    onValuesChangeRef.current = onValuesChange;
  }, [onValuesChange]);

  // Store previous values to avoid unnecessary calls
  const prevValuesRef = useRef({
    headshipEmploymentFactor,
    carryOverLessons,
    classTeacher,
    weeklyLessonsForTransportation,
  });

  // Notify parent of value changes
  useEffect(() => {
    if (
      onValuesChangeRef.current &&
      (prevValuesRef.current.headshipEmploymentFactor !== headshipEmploymentFactor ||
        prevValuesRef.current.carryOverLessons !== carryOverLessons ||
        prevValuesRef.current.classTeacher !== classTeacher ||
        prevValuesRef.current.weeklyLessonsForTransportation !== weeklyLessonsForTransportation)
    ) {
      try {
        const specialFunctionData: SpecialFunctionData = {
          headshipEmploymentFactor: headshipEmploymentFactor ?? 0,
          carryOverLessons: carryOverLessons ?? 0,
          classTeacher: classTeacher ?? false,
          weeklyLessonsForTransportation: (weeklyLessonsForTransportation ?? 0) as WeeklyLessonsForTransportation,
        };
        onValuesChangeRef.current(specialFunctionData);
        prevValuesRef.current = {
          headshipEmploymentFactor,
          carryOverLessons,
          classTeacher,
          weeklyLessonsForTransportation,
        };
      } catch (error) {
        // Ignore errors during form filling
      }
    }
  }, [headshipEmploymentFactor, carryOverLessons, classTeacher, weeklyLessonsForTransportation]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
      className={className}
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
                    min="0"
                    max="100"
                    value={String(field.state.value ?? "")}
                    placeholder="20%"
                    onChange={(event) =>
                      field.handleChange(Number(event.target.value))
                    }
                    className={`h-9 border-amber-100 ${hasError ? "border-destructive" : ""}`}
                    aria-invalid={hasError}
                    disabled={isLoading}
                  />
                  <InputGroupAddon align="inline-end">
                    <span>%</span>
                  </InputGroupAddon>
                </InputGroup>
                {hasError && <FieldError errors={field.state.meta.errors} />}
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
                  className={`h-9 ${hasError ? "border-destructive" : ""}`}
                  aria-invalid={hasError}
                  disabled={isLoading}
                />
                {hasError && <FieldError errors={field.state.meta.errors} />}
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
                  disabled={isLoading}
                />
                {hasError && <FieldError errors={field.state.meta.errors} />}
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
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={`h-9 w-full ${hasError ? "border-destructive" : ""}`}
                  >
                    <SelectValue placeholder="Auswählen..." className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 Lektionen</SelectItem>
                    <SelectItem value="0.5">0.5 Lektionen</SelectItem>
                    <SelectItem value="1">1 Lektionen</SelectItem>
                    <SelectItem value="1.5">1.5 Lektionen</SelectItem>
                    <SelectItem value="2">2 Lektionen</SelectItem>
                  </SelectContent>
                </Select>
                {hasError && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
}

