"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import { FieldError } from "@/components/ui/field";
import {
  TEACHING_ADVINSING_SUPPORTING_SUBCATEGORIES_LABELS,
  WORK_TIME_CATEGORY_LABELS,
  WorkTimeCategory,
} from "@scholatempus/shared/enums";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type TimeEntry, TimeEntryZodSchema } from "@scholatempus/shared/schemas";
import { useAddWorkEntries } from "../hooks/addWorkEntries";
import { useUpdateWorkEntry } from "@/features/calendar/hooks/useUpdateWorkEntry";
import { useEffect, useState } from "react";

interface CategorySelectionDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  totalTime: number;
  onCancelAction: () => void;
  entryToEdit?: {
    workTimeEntryId: number;
    date: Date | string;
    category: string;
    subcategory: string | null;
    workingTime: number;
  };
  selectedDate?: Date;
  isCalendarContext?: boolean;
  isManually?: boolean;
}

export function CategorySelectionDialog({
  open,
  onOpenChangeAction,
  totalTime,
  onCancelAction,
  entryToEdit,
  selectedDate,
  isCalendarContext = false,
  isManually = false,
}: CategorySelectionDialogProps) {
  const addWorkEntriesMutation = useAddWorkEntries();
  const updateWorkEntryMutation = useUpdateWorkEntry();
  const isEditing = !!entryToEdit;
  const [selectedDateState, setSelectedDateState] = useState<Date | undefined>(
    selectedDate,
  );

  // For calendar context, use a default total time if not provided
  // For home context, use the provided totalTime
  const effectiveTotalTime = isCalendarContext
    ? totalTime > 0
      ? totalTime
      : 1000 * 60 * 60
    : totalTime > 0
      ? totalTime
      : 1000 * 60 * 60;

  // Update selected date state when prop changes
  useEffect(() => {
    if (selectedDate) {
      setSelectedDateState(selectedDate);
    }
  }, [selectedDate]);

  const getTotalDistributedTime = (entries: TimeEntry[]) => {
    return entries.reduce(
      (total, entry) => total + (entry.workingTime || 0),
      0,
    );
  };

  const schema = z.object({
    entries: z
      .array(TimeEntryZodSchema)
      .min(1, { message: "At least one entry is required" })
      .superRefine((entries, ctx) => {
        // Only validate total time for non-calendar context (home screen)
        if (!isCalendarContext) {
          const totalDistributed = getTotalDistributedTime(entries);
          if (totalDistributed > Math.floor(effectiveTotalTime / 60000)) {
            ctx.addIssue({
              code: "custom",
              message: `Total distributed time (${totalDistributed}min) cannot exceed session time (${Math.floor(effectiveTotalTime / 60000)}min)`,
              path: ["entries"],
            });
          }
        }
      }),
  });

  type FormValues = z.infer<typeof schema>;

  const getDefualtValues = (): FormValues => {
    if (isEditing && entryToEdit) {
      return {
        entries: [
          {
            workingTime: entryToEdit.workingTime,
            category: entryToEdit.category,
            subcategory: entryToEdit.subcategory || undefined,
          },
        ],
      };
    }
    // If manually adding, start with 0 minutes so user can input time from beginning
    const defaultWorkingTime = isManually
      ? 0
      : Math.floor(effectiveTotalTime / 60000);
    return {
      entries: [
        {
          workingTime: defaultWorkingTime,
          category: "",
          subcategory: undefined,
        },
      ],
    };
  };

  const form = useForm({
    defaultValues: getDefualtValues(),
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      if (isEditing && entryToEdit && value.entries[0]) {
        handleUpdateEntry(value.entries[0]);
      } else {
        handleCategorySelection(value.entries);
      }
    },
  });

  // Reset form when dialog opens or entryToEdit changes
  useEffect(() => {
    if (open) {
      form.reset(getDefualtValues());
    }
  }, [open, entryToEdit?.workTimeEntryId]);

  const handleCategorySelection = (entries: TimeEntry[]): void => {
    // For calendar context, we need to handle date separately
    // Note: The backend addWorkEntries endpoint currently sets date to new Date()
    // We'll need to modify the backend or create a separate endpoint for calendar entries
    // For now, we'll use the existing endpoint and the date will be set on the backend

    // Transform entries to API format
    const apiEntries = {
      entries: entries.map((entry) => ({
        category: entry.category,
        subcategory: entry.subcategory,
        workingTime: entry.workingTime, // Already in minutes from the form
        isManually: isManually,
      })),
    };

    // Save to backend
    addWorkEntriesMutation.mutate(apiEntries, {
      onSuccess: () => {
        onOpenChangeAction(false);
      },
    });
  };

  const handleUpdateEntry = (entry: TimeEntry): void => {
    if (!entryToEdit) return;

    updateWorkEntryMutation.mutate(
      {
        id: entryToEdit.workTimeEntryId,
        category: entry.category,
        subcategory: entry.subcategory ?? null,
        workingTime: entry.workingTime,
        date:
          selectedDate ||
          (typeof entryToEdit.date === "string"
            ? new Date(entryToEdit.date)
            : entryToEdit.date),
      },
      {
        onSuccess: () => {
          onOpenChangeAction(false);
        },
      },
    );
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${hours}h${minutes.toString().padStart(2, "0")}min`;
  };

  const calculateTimeForInput = (time: number) => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
  };

  const addEntry = () => {
    const newEntry: TimeEntry = {
      workingTime: 0,
      category: "",
      subcategory: undefined,
    };
    form.pushFieldValue("entries", newEntry);
  };

  const removeEntry = (id: number) => {
    if (form.state.values.entries.length > 1) {
      form.removeFieldValue("entries", id);
    }
  };

  const handleCancel = () => {
    onCancelAction();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Arbeitseintrag bearbeiten" : "Arbeitseintrag erfassen"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Aktualisieren Sie die Details des Arbeitseintrags."
              : "Erfassen Sie Ihre geleistete Arbeitszeit."}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {isCalendarContext && !isEditing && selectedDateState && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Datum</Label>
              <Input
                type="date"
                defaultValue={selectedDateState.toISOString().split("T")[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setSelectedDateState(newDate);
                }}
                className="w-full"
              />
            </div>
          )}
          {!isCalendarContext && (
            <div className="flex justify-between items-center">
              <div>
                <Label className="text-sm font-medium">Sitzungszeit:</Label>
                <div className="text-lg font-semibold">
                  {effectiveTotalTime > 0
                    ? formatTime(effectiveTotalTime)
                    : "0h00min"}
                </div>
              </div>

              <form.Subscribe selector={(state) => state.values.entries.length}>
                {(entriesLength) =>
                  entriesLength > 1 && (
                    <div className="text-right">
                      <Label className="text-sm font-medium">
                        Verteilt:
                      </Label>
                      <div className="text-lg font-semibold">
                        {getTotalDistributedTime(form.state.values.entries)}min
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Verbleibend:{" "}
                        {Math.max(
                          0,
                          Math.floor(effectiveTotalTime / 60000) -
                            getTotalDistributedTime(form.state.values.entries),
                        )}
                        min
                      </div>
                    </div>
                  )
                }
              </form.Subscribe>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="entries"
              mode="array"
              children={() => {
                return (
                  <ScrollArea className="h-100">
                    <div className="space-y-4">
                      {form.state.values.entries.map((entry, i) => {
                        return (
                          <div
                            key={i}
                            className="space-y-3 p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium">
                                Arbeitszeit (Minuten):
                              </Label>
                              <div className="flex-1" />
                              {form.state.values.entries.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEntry(i)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <form.Field
                              name={`entries[${i}].workingTime`}
                              children={(workingTimeField) => {
                                const workingTimeInvalid =
                                  workingTimeField.state.meta.isTouched &&
                                  !workingTimeField.state.meta.isValid;
                                return (
                                  <div>
                                    <Input
                                      type="time"
                                      id="time-picker"
                                      defaultValue={calculateTimeForInput(
                                        entry.workingTime,
                                      )}
                                      onChange={(event) => {
                                        const timeElements =
                                          event.target.value.split(":");

                                        const hourse = Number(timeElements[0]);
                                        const minutes = Number(timeElements[1]);
                                        workingTimeField.handleChange(
                                          hourse * 60 + minutes,
                                        );
                                      }}
                                      disabled={
                                        !isManually &&
                                        (form.state.values.entries.length <=
                                          1 ||
                                          isEditing)
                                      }
                                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                    {workingTimeInvalid && (
                                      <FieldError
                                        errors={
                                          workingTimeField.state.meta.errors
                                        }
                                      ></FieldError>
                                    )}
                                  </div>
                                );
                              }}
                            />

                            <form.Field
                              name={`entries[${i}].category`}
                              children={(categoryField) => {
                                const categoryInvalid =
                                  categoryField.state.meta.isTouched &&
                                  !categoryField.state.meta.isValid;
                                return (
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">
                                      Kategorie
                                    </Label>
                                    <Select
                                      onValueChange={(value) => {
                                        (console.log(
                                          "work time category",
                                          value,
                                        ),
                                          categoryField.handleChange(value));
                                      }}
                                      value={categoryField.state.value}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Kategorie auswählen..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.entries(
                                          WORK_TIME_CATEGORY_LABELS,
                                        ).map(([key, category]) => (
                                          <SelectItem key={key} value={key}>
                                            {category}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    {categoryInvalid && (
                                      <FieldError
                                        errors={categoryField.state.meta.errors}
                                      ></FieldError>
                                    )}
                                  </div>
                                );
                              }}
                            />
                            <form.Subscribe
                              selector={(state) =>
                                state.values.entries[i]?.category ?? ""
                              }
                            >
                              {(category) => {
                                if (
                                  category ===
                                  WorkTimeCategory.TeachingAdvisingSupporting
                                ) {
                                  return (
                                    <form.Field
                                      name={`entries[${i}].subcategory`}
                                      children={(field) => {
                                        const subcategoryInvalid =
                                          field.state.meta.isTouched &&
                                          !field.state.meta.isValid;
                                        return (
                                          <div>
                                            <Label className="text-sm font-medium mb-2 block">
                                              Unterkategorie
                                            </Label>
                                            <Select
                                              onValueChange={(value) => {
                                                console.log(
                                                  "subcategory",
                                                  value,
                                                );
                                                field.handleChange(value);
                                              }}
                                              value={field.state.value}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Unterkategorie auswählen..." />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {Object.entries(
                                                  TEACHING_ADVINSING_SUPPORTING_SUBCATEGORIES_LABELS,
                                                ).map(([key, subcategory]) => (
                                                  <SelectItem
                                                    key={key}
                                                    value={key}
                                                  >
                                                    {subcategory}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            {subcategoryInvalid && (
                                              <FieldError
                                                errors={field.state.meta.errors}
                                              ></FieldError>
                                            )}
                                          </div>
                                        );
                                      }}
                                    />
                                  );
                                }
                              }}
                            </form.Subscribe>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                );
              }}
            ></form.Field>
            {!isEditing && (
              <Button
                type="button"
                variant="ghost"
                onClick={addEntry}
                className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                Weiteren Eintrag hinzufügen
              </Button>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 bg-transparent"
              >
                Zurück
              </Button>

              <Button
                type="submit"
                className="flex-1"
                disabled={
                  isEditing
                    ? updateWorkEntryMutation.isPending
                    : addWorkEntriesMutation.isPending
                }
              >
                {isEditing ? "Aktualisieren" : "Speichern"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
