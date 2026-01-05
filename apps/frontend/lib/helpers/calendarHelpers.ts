import {
  format,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay,
  startOfToday,
  startOfYesterday,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";

/**
 * Get the Monday of the week for a given date
 */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
}

/**
 * Get the Sunday of the week for a given date
 */
export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
}

/**
 * Get the week range (start and end) for a given date
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  return {
    start: getWeekStart(date),
    end: getWeekEnd(date),
  };
}

/**
 * Check if a date is within a given week
 */
export function isDateInWeek(date: Date, weekStart: Date): boolean {
  const weekEnd = getWeekEnd(weekStart);
  return isWithinInterval(date, { start: weekStart, end: weekEnd });
}

/**
 * Group work entries by day of the week
 */
export function groupEntriesByDay<T extends { date: Date | string }>(
  entries: T[]
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  entries.forEach((entry) => {
    const entryDate = typeof entry.date === "string" ? new Date(entry.date) : entry.date;
    const dayKey = format(entryDate, "yyyy-MM-dd");
    
    if (!grouped[dayKey]) {
      grouped[dayKey] = [];
    }
    grouped[dayKey].push(entry);
  });

  return grouped;
}

/**
 * Format week range for display
 */
export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const startFormatted = format(weekStart, "MMM d");
  const endFormatted = format(weekEnd, "MMM d, yyyy");
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Get the next week from a given week start date
 */
export function getNextWeek(weekStart: Date): Date {
  return addWeeks(weekStart, 1);
}

/**
 * Get the previous week from a given week start date
 */
export function getPreviousWeek(weekStart: Date): Date {
  return subWeeks(weekStart, 1);
}

/**
 * Format a date for display in the table
 */
export function formatDateForTable(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "EEE, MMM d");
}

/**
 * Format a date range for display
 */
export function formatDateRange(start: Date, end: Date): string {
  const startFormatted = format(start, "MMM d, yyyy");
  const endFormatted = format(end, "MMM d, yyyy");
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Check if a date is within a date range
 */
export function isDateInRange(
  date: Date,
  range: { start: Date; end: Date }
): boolean {
  return isWithinInterval(date, {
    start: startOfDay(range.start),
    end: endOfDay(range.end),
  });
}

/**
 * Get preset date ranges
 */
export type DateRangePreset =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear"
  | "allTime"
  | "24hours"
  | "7days"
  | "30days"
  | "12months";

export function getDateRangePreset(
  preset: DateRangePreset
): { start: Date; end: Date } {
  const today = startOfToday();
  const yesterday = startOfYesterday();

  switch (preset) {
    case "today":
      return {
        start: startOfDay(today),
        end: endOfDay(today),
      };
    case "yesterday":
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
      };
    case "thisWeek":
      return {
        start: startOfWeek(today, { weekStartsOn: 1 }),
        end: endOfWeek(today, { weekStartsOn: 1 }),
      };
    case "lastWeek":
      const lastWeekStart = subWeeks(
        startOfWeek(today, { weekStartsOn: 1 }),
        1
      );
      return {
        start: lastWeekStart,
        end: endOfWeek(lastWeekStart, { weekStartsOn: 1 }),
      };
    case "thisMonth":
      return {
        start: startOfMonth(today),
        end: endOfMonth(today),
      };
    case "lastMonth":
      const lastMonth = subMonths(today, 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    case "thisYear":
      return {
        start: startOfYear(today),
        end: endOfYear(today),
      };
    case "lastYear":
      const lastYear = subYears(today, 1);
      return {
        start: startOfYear(lastYear),
        end: endOfYear(lastYear),
      };
    case "24hours":
      return {
        start: subDays(today, 1),
        end: endOfDay(today),
      };
    case "7days":
      return {
        start: subDays(today, 6),
        end: endOfDay(today),
      };
    case "30days":
      return {
        start: subDays(today, 29),
        end: endOfDay(today),
      };
    case "12months":
      return {
        start: subMonths(today, 11),
        end: endOfDay(today),
      };
    case "allTime":
      // Return a very wide range - in practice, you might want to use a specific start date
      return {
        start: new Date(2000, 0, 1),
        end: endOfDay(today),
      };
    default:
      return {
        start: startOfDay(today),
        end: endOfDay(today),
      };
  }
}

