"use client";

import { useMemo, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateMandatoryLectures } from "@/lib/helpers/SetupCalculators";
import { classDataFormSchema, type SetupFormData } from "@/lib/validations";
import { useForm, useStore } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  ClassData,
  GRADE_LEVEL_LABELS,
  GradeLevel,
} from "@scholatempus/shared";
import { getGradeLevelFromLabel } from "@/lib/helpers/getGradeLevelFromLabel";

interface ClassDataFormProps {
  defaultValues?: {
    grade?: string;
    givenLectures?: number;
    mandatoryLectures?: number;
    carryOverLectures?: number;
  };
  onSubmit: (data: ClassData) => void | Promise<void>;
  onValuesChange?: (data: ClassData) => void;
  isLoading?: boolean;
  className?: string;
}

export function ClassDataForm({
  defaultValues,
  onSubmit,
  onValuesChange,
  isLoading = false,
  className = "",
}: ClassDataFormProps) {
  const form = useForm({
    defaultValues: {
      grade:
        defaultValues?.grade ??
        GRADE_LEVEL_LABELS[GradeLevel.PrimarySchoolGymnasiumEntry],
      givenLectures: defaultValues?.givenLectures ?? 0,
      mandatoryLectures: defaultValues?.mandatoryLectures ?? 28,
      carryOverLectures: defaultValues?.carryOverLectures ?? 0,
    },
    validators: {
      onSubmit: classDataFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed: SetupFormData = classDataFormSchema.parse(value);
      const classData: ClassData = {
        grade: getGradeLevelFromLabel(parsed.grade),
        givenLectures: parsed.givenLectures,
        mandatoryLectures: parsed.mandatoryLectures,
        carryOverLectures: parsed.carryOverLectures,
      };
      await onSubmit(classData);
    },
  });

  const grade = useStore(form.store, (state) => state.values.grade);
  const givenLectures = useStore(form.store, (state) => state.values.givenLectures);
  const mandatoryLectures = useStore(form.store, (state) => state.values.mandatoryLectures);
  const carryOverLectures = useStore(form.store, (state) => state.values.carryOverLectures);
  
  const availableMandatoryLectures = useMemo(
    () => calculateMandatoryLectures(getGradeLevelFromLabel(grade)),
    [grade],
  );

  // Store callback in ref to avoid infinite loops
  const onValuesChangeRef = useRef(onValuesChange);
  useEffect(() => {
    onValuesChangeRef.current = onValuesChange;
  }, [onValuesChange]);

  // Store previous values to avoid unnecessary calls
  const prevValuesRef = useRef({ grade, givenLectures, mandatoryLectures, carryOverLectures });

  // Notify parent of value changes
  useEffect(() => {
    if (
      onValuesChangeRef.current &&
      grade &&
      (prevValuesRef.current.grade !== grade ||
        prevValuesRef.current.givenLectures !== givenLectures ||
        prevValuesRef.current.mandatoryLectures !== mandatoryLectures ||
        prevValuesRef.current.carryOverLectures !== carryOverLectures)
    ) {
      try {
        const classData: ClassData = {
          grade: getGradeLevelFromLabel(grade),
          givenLectures: givenLectures ?? 0,
          mandatoryLectures: mandatoryLectures ?? 28,
          carryOverLectures: carryOverLectures ?? 0,
        };
        onValuesChangeRef.current(classData);
        prevValuesRef.current = { grade, givenLectures, mandatoryLectures, carryOverLectures };
      } catch (error) {
        // Ignore errors during form filling
      }
    }
  }, [grade, givenLectures, mandatoryLectures, carryOverLectures]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className={className}
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
              fieldApi.form.setFieldValue("mandatoryLectures", nextMandatory);
              fieldApi.form.setFieldValue("givenLectures", (prev: number | undefined) => {
                if (prev == null || prev === 0) return nextMandatory;
                return Math.min(prev, nextMandatory);
              });
            },
          }}
          children={(field) => {
            const hasError = field.state.meta.errors.length > 0;
            return (
              <Field data-invalid={hasError}>
                <FieldLabel className="text-sm font-medium">Stufe</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(newValue) =>
                    field.handleChange(newValue as GradeLevel)
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
                    {Object.values(GRADE_LEVEL_LABELS).map((gradeLabel) => (
                      <SelectItem key={gradeLabel} value={gradeLabel} className="truncate">
                        <span className="truncate">{gradeLabel}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasError && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

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
                  className={`h-9 ${hasError ? "border-destructive" : ""}`}
                  min="0"
                  max="50"
                  aria-invalid={hasError}
                  disabled={isLoading}
                />
                {hasError && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="mandatoryLectures"
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
                  value={String(field.state.value ?? "")}
                  onValueChange={(val) => {
                    if (!val) return;
                    const next = Number(val);
                    if (!Number.isFinite(next)) return;
                    field.handleChange(next);
                  }}
                  aria-invalid={isInvalid}
                  disabled={isLoading || !grade || mandatoryLectures.length === 0}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Auswählen..." className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMandatoryLectures.map((mandatoryLecture) => (
                      <SelectItem
                        key={mandatoryLecture}
                        value={mandatoryLecture.toString()}
                      >
                        {mandatoryLecture} Lektionen
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

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
                  className="h-9"
                  min="0"
                  disabled={isLoading}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
}

