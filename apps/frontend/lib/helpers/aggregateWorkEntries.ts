import { WorkTimeCategory } from "@scholatempus/shared/enums";

interface WorkEntry {
  category: string;
  workingTime: number;
}

/**
 * Aggregates work entries by category, summing up the workingTime for each category.
 * Returns a Record mapping each WorkTimeCategory to its total actual hours.
 */
export function aggregateWorkEntriesByCategory(
  workEntries: WorkEntry[],
): Record<WorkTimeCategory, number> {
  // Initialize all categories with 0
  const aggregated = Object.values(WorkTimeCategory).reduce(
    (acc, category) => {
      acc[category] = 0;
      return acc;
    },
    {} as Record<WorkTimeCategory, number>,
  );

  // Sum up workingTime for each category.
  // TeachingSupervision stores raw lesson count; all others store minutes → convert to hours.
  for (const entry of workEntries) {
    const category = entry.category as WorkTimeCategory;
    if (Object.values(WorkTimeCategory).includes(category)) {
      if (category === WorkTimeCategory.TeachingSupervision) {
        aggregated[category] = (aggregated[category] || 0) + entry.workingTime;
      } else {
        aggregated[category] = (aggregated[category] || 0) + entry.workingTime / 60;
      }
    }
  }

  return aggregated;
}

