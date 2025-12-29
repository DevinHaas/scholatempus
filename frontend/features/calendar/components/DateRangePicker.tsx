"use client";

import { useState, useEffect } from "react";
import { type DateRange } from "react-day-picker";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDateRangePreset,
  type DateRangePreset,
  formatDateRange,
} from "@/lib/helpers/calendarHelpers";

interface DateRangePickerProps {
  value: { start: Date; end: Date };
  onChange: (range: { start: Date; end: Date }) => void;
}

const PRESET_OPTIONS: Array<{ label: string; value: DateRangePreset }> = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This week", value: "thisWeek" },
  { label: "Last week", value: "lastWeek" },
  { label: "This month", value: "thisMonth" },
  { label: "Last month", value: "lastMonth" },
  { label: "This year", value: "thisYear" },
  { label: "Last year", value: "lastYear" },
  { label: "All time", value: "allTime" },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({
    from: value.start,
    to: value.end,
  });
  const [startInput, setStartInput] = useState(
    format(value.start, "MMM d, yyyy")
  );
  const [endInput, setEndInput] = useState(format(value.end, "MMM d, yyyy"));
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset | null>(
    null
  );

  const handlePresetSelect = (preset: DateRangePreset) => {
    const range = getDateRangePreset(preset);
    setSelectedRange({ from: range.start, to: range.end });
    setStartInput(format(range.start, "MMM d, yyyy"));
    setEndInput(format(range.end, "MMM d, yyyy"));
    setSelectedPreset(preset);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    if (range?.from) {
      setStartInput(format(range.from, "MMM d, yyyy"));
    }
    if (range?.to) {
      setEndInput(format(range.to, "MMM d, yyyy"));
    }
    setSelectedPreset(null);
  };

  const handleStartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setStartInput(inputValue);
    try {
      // Try parsing with the expected format first
      let date: Date;
      try {
        date = parse(inputValue, "MMM d, yyyy", new Date());
      } catch {
        // Fallback to default Date parsing
        date = new Date(inputValue);
      }
      if (!isNaN(date.getTime())) {
        setSelectedRange((prev) => ({
          from: date,
          to: prev?.to,
        }));
        setSelectedPreset(null);
      }
    } catch {
      // Invalid date, keep input as is
    }
  };

  const handleEndInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setEndInput(inputValue);
    try {
      // Try parsing with the expected format first
      let date: Date;
      try {
        date = parse(inputValue, "MMM d, yyyy", new Date());
      } catch {
        // Fallback to default Date parsing
        date = new Date(inputValue);
      }
      if (!isNaN(date.getTime())) {
        setSelectedRange((prev) => ({
          from: prev?.from,
          to: date,
        }));
        setSelectedPreset(null);
      }
    } catch {
      // Invalid date, keep input as is
    }
  };

  const handleApply = () => {
    if (selectedRange?.from && selectedRange?.to) {
      onChange({
        start: selectedRange.from,
        end: selectedRange.to,
      });
      setOpen(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setSelectedRange({ from: value.start, to: value.end });
    setStartInput(format(value.start, "MMM d, yyyy"));
    setEndInput(format(value.end, "MMM d, yyyy"));
    setSelectedPreset(null);
    setOpen(false);
  };

  // Update inputs when value prop changes
  useEffect(() => {
    if (!open) {
      setStartInput(format(value.start, "MMM d, yyyy"));
      setEndInput(format(value.end, "MMM d, yyyy"));
      setSelectedRange({ from: value.start, to: value.end });
    }
  }, [value, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-fit lg:w-50% justify-start text-left font-normal mr-2",
            !value && "text-muted-foreground"
          )}
        >
          <Filter className="mr-2 h-4 w-4" />
          <span className="truncate">{formatDateRange(value.start, value.end)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto max-w-[min(900px,calc(100vw-2rem))] p-0"
        align="start"
        sideOffset={8}
      >
        <div className="p-2 sm:p-4 max-h-[600px] overflow-y-auto">
          {/* Preset Select */}
          <div className="mb-3 sm:mb-4">
            <Select
              value={selectedPreset || "none"}
              onValueChange={(value) => {
                if (value === "none") {
                  setSelectedPreset(null);
                } else {
                  handlePresetSelect(value as DateRangePreset);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a preset..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {PRESET_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calendar */}
          <div className="flex justify-center overflow-x-auto pb-2">
            <Calendar
              mode="range"
              defaultMonth={selectedRange?.from}
              selected={selectedRange}
              onSelect={handleCalendarSelect}
              className="rounded-md border"
              classNames={{
                range_start: "bg-primary/20 dark:bg-primary/10 rounded-l-full",
                range_end: "bg-primary/20 dark:bg-primary/10 rounded-r-full",
                day_button:
                  "data-[range-end=true]:rounded-full! data-[range-start=true]:rounded-full! data-[range-start=true]:bg-primary! data-[range-start=true]:text-primary-foreground! data-[range-start=true]:dark:bg-primary! data-[range-start=true]:group-data-[focused=true]/day:ring-primary/20 data-[range-start=true]:dark:group-data-[focused=true]/day:ring-primary/40 data-[range-end=true]:bg-primary! data-[range-end=true]:text-primary-foreground! data-[range-end=true]:dark:bg-primary! data-[range-end=true]:group-data-[focused=true]/day:ring-primary/20 data-[range-end=true]:dark:group-data-[focused=true]/day:ring-primary/40 data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-primary/20 data-[range-middle=true]:dark:bg-primary/10 hover:rounded-full",
                today:
                  "data-[selected=true]:rounded-l-none! rounded-full bg-accent! data-[selected=true]:bg-primary/20! dark:data-[selected=true]:bg-primary/10! [&_button[data-range-middle=true]]:bg-transparent!",
              }}
            />
          </div>

          {/* Custom date inputs */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
            <Input
              type="text"
              value={startInput}
              onChange={handleStartInputChange}
              placeholder="Start date"
              className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
            />
            <span className="text-muted-foreground text-xs sm:text-sm flex-shrink-0">-</span>
            <Input
              type="text"
              value={endInput}
              onChange={handleEndInputChange}
              placeholder="End date"
              className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-1.5 sm:gap-2 mt-2 sm:mt-3">
            <Button variant="outline" onClick={handleCancel} size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!selectedRange?.from || !selectedRange?.to}
              size="sm"
              className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

