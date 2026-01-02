import { GRADE_LEVEL_LABELS, GradeLevel } from "@scholatempus/shared";

export const getGradeLevelFromLabel = (label: string): GradeLevel => {
  const key = Object.entries(GRADE_LEVEL_LABELS).find(
    (entry) => entry[1] === label,
  )?.[0];
  return key as GradeLevel;
};
