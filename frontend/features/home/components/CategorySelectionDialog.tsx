"use client";

import { useEffect, useState } from "react";
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
} from "scholatempus-backend/shared/enums";

const zodEntry = z.object({
  workingTime: z.number(),
  category: z.enum(Object.values(WorkTimeCategory) as [string, ...string[]], {
    message: "Please select a category",
  }),
  subcategory: z
    .string({
      message:
        "Please select a subcategory for the category Unterrichten, beraten, begleiten",
    })
    .optional(),
});

const schema = z.object({
  entries: z
    .array(zodEntry)
    .min(1, { message: "At least one entry is required" }),
});

type TimeEntry = z.infer<typeof zodEntry>;
type FormValues = z.infer<typeof schema>;

interface CategorySelectionDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  totalTime: number;
  onSaveAction: (entries: TimeEntry[]) => void;
  onCancelAction: () => void;
}

export function CategorySelectionDialog({
  open,
  onOpenChangeAction,
  totalTime,
  onSaveAction,
  onCancelAction,
}: CategorySelectionDialogProps) {
  totalTime = 1000 * 60 * 60;
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [validationError, setValidationError] = useState<string>("");

  const getDefualtValues = (): FormValues => {
    return {
      entries: [
        {
          workingTime: Math.floor(totalTime / 60000),
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
      console.log("submit", value);
      console.log(value);
    },
  });

  useEffect(() => {
    if (open) {
      setEntries([
        {
          workingTime: Math.floor(totalTime / 60000),
          category: "",
          subcategory: "",
        },
      ]);
      setValidationError("");
    }
  }, [open, totalTime]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${hours}h${minutes.toString().padStart(2, "0")}min`;
  };

  const getTotalDistributedTime = () => {
    return entries.reduce(
      (total, entry) => total + (entry.workingTime || 0),
      0,
    );
  };

  const calculateTimeForInput = (time: number) => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
  };

  const validateTimeDistribution = () => {
    const totalDistributed = getTotalDistributedTime();
    const totalSessionMinutes = Math.floor(totalTime / 60000);

    if (totalDistributed > totalSessionMinutes) {
      setValidationError(
        `Total distributed time (${totalDistributed}min) cannot exceed session time (${totalSessionMinutes}min)`,
      );
      return false;
    }

    setValidationError("");
    return true;
  };

  const addEntry = () => {
    const newEntry: TimeEntry = {
      workingTime: 0,
      category: "",
      subcategory: "",
    };
    form.setFieldValue("entries", [...entries, newEntry]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter((entry) => entry.id !== id));
      setTimeout(validateTimeDistribution, 0);
    }
  };

  const handleSave = () => {
    if (validateTimeDistribution()) {
      onSaveAction(entries);
    }
  };

  const handleCancel = () => {
    onCancelAction();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dimensions</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Set the dimensions for the layer.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Label className="text-sm font-medium">Session Time:</Label>
              <div className="text-lg font-semibold">
                {totalTime > 0 ? formatTime(totalTime) : "0h00min"}
              </div>
            </div>

            {entries.length > 1 && (
              <div className="text-right">
                <Label className="text-sm font-medium">Distributed:</Label>
                <div className="text-lg font-semibold">
                  {getTotalDistributedTime()}min
                </div>
                <div className="text-xs text-muted-foreground">
                  Remaining:{" "}
                  {Math.max(
                    0,
                    Math.floor(totalTime / 60000) - getTotalDistributedTime(),
                  )}
                  min
                </div>
              </div>
            )}
          </div>

          {validationError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
              {validationError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              console.log("submit");
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="entries"
              mode="array"
              children={(field) => {
                const fieldInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                console.log(field.state.meta);
                return (
                  <div className="space-y-4">
                    {entries.map((entry, i) => {
                      return (
                        <div
                          key={i}
                          className="space-y-3 p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">
                              Working Time (minutes):
                            </Label>
                            <div className="flex-1" />
                            {entries.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEntry(i.toString())}
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
                                      console.log(hourse * 60 + minutes);
                                      workingTimeField.handleChange(
                                        hourse * 60 + minutes,
                                      );
                                    }}
                                    disabled={entries.length <= 1}
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
                                    Category
                                  </Label>
                                  <Select
                                    onValueChange={(value) =>
                                      categoryField.handleChange(value)
                                    }
                                    value={categoryField.state.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category..." />
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
                              state.values.entries[i].category
                            }
                          >
                            {(category) => {
                              console.log(category);
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
                                            Subcategory
                                          </Label>
                                          <Select
                                            onValueChange={(value) =>
                                              field.handleChange(value)
                                            }
                                            value={field.state.value}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select subcategory..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {Object.entries(
                                                TEACHING_ADVINSING_SUPPORTING_SUBCATEGORIES_LABELS,
                                              ).map((element) => (
                                                <SelectItem
                                                  key={element[0]}
                                                  value={element[1]}
                                                >
                                                  {element[1]}
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
                );
              }}
            ></form.Field>
            <Button
              variant="ghost"
              onClick={addEntry}
              className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              Add more
            </Button>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 bg-transparent"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Save
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
