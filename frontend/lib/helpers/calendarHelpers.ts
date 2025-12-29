import { format, startOfWeek, endOfWeek, isWithinInterval, addWeeks, subWeeks } from "date-fns";

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

