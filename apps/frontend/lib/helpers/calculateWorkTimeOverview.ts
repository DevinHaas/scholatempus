import { getHourseMultiplierPerCategory } from "./SetupCalculators";
import { HOURS_TO_WORK_PER_SEMESTER, NUMBER_OF_SCHOOL_WEEKS } from "../DATA";
import {
  ClassData,
  SpecialFunctionData,
  WorkTimeCategory,
} from "@scholatempus/shared";

interface WorkTimeDetail {
  targetHours: number;
  actualHours: number;
  differenceHours: number;
}

type WorkedTimePerCategory = Record<WorkTimeCategory, WorkTimeDetail>;

interface WorkTimeSummary {
  totalTeacherWorkTime: {
    targetHours: number;
    actualHours: number;
    balanceHours: number;
  };
  totalEmploymentFactor: number;
  schoolManagementBalanceHours: number;
}

export interface WorkTimeOverviewData {
  details: WorkedTimePerCategory | undefined;
  summary: WorkTimeSummary;
}

/**
 * Calculates the total employment factor based on class data and special function data.
 */
function calculateTotalEmploymentFactor(
  classData: ClassData,
  specialFunctionData: SpecialFunctionData,
): number {
  return (
    (100 / classData.mandatoryLectures) * classData.givenLectures +
    specialFunctionData.headshipEmploymentFactor +
    (specialFunctionData.classTeacher ? 5 : 0)
  );
}

/**
 * Calculates work time overview (target hours, actual hours, differences) based on
 * class data, special function data, and actual hours per category.
 *
 * @param classData - The class data configuration
 * @param specialFunctionData - The special function data configuration
 * @param actualHoursPerCategory - Record mapping each category to its total actual hours
 * @returns WorkTimeOverviewData with calculated target/actual/difference hours
 */
export function calculateWorkTimeOverview(
  classData: ClassData,
  specialFunctionData: SpecialFunctionData,
  actualHoursPerCategory: Record<WorkTimeCategory, number>,
): WorkTimeOverviewData {
  let totalTeacherWorkTime = 0;
  let totalTeacherActualWorkTime = 0;
  const details = Object.values(WorkTimeCategory)
    .filter((c) => c !== WorkTimeCategory.TeachingSupervision)
    .reduce<WorkedTimePerCategory>((acc, category) => {
      const multiplier = getHourseMultiplierPerCategory(category);

      let targetHours: number = 0;
      if (category === WorkTimeCategory.SchoolManagement) {
        targetHours =
          (multiplier *
            HOURS_TO_WORK_PER_SEMESTER *
            specialFunctionData.headshipEmploymentFactor) /
          100;
        totalTeacherWorkTime += targetHours;
      } else {
        targetHours = multiplier * HOURS_TO_WORK_PER_SEMESTER;
        totalTeacherWorkTime += targetHours;
      }

      const actualHours = actualHoursPerCategory[category] ?? 0;
      totalTeacherActualWorkTime += actualHours;

      acc[category] = {
        targetHours,
        actualHours,
        differenceHours: actualHours - targetHours,
      };

      return acc;
    }, {} as WorkedTimePerCategory);

  const teachingSupervisionTargetHours =
    (NUMBER_OF_SCHOOL_WEEKS * classData.givenLectures) / 2;

  const actualTeachingSupervisionHours =
    actualHoursPerCategory[WorkTimeCategory.TeachingSupervision] ?? 0;
  details[WorkTimeCategory.TeachingSupervision] = {
    targetHours: teachingSupervisionTargetHours,
    actualHours: actualTeachingSupervisionHours,
    differenceHours:
      actualTeachingSupervisionHours - teachingSupervisionTargetHours,
  };

  const summary: WorkTimeSummary = {
    totalTeacherWorkTime: {
      targetHours: totalTeacherWorkTime,
      actualHours: totalTeacherActualWorkTime,
      balanceHours: totalTeacherActualWorkTime - totalTeacherWorkTime,
    },
    totalEmploymentFactor: calculateTotalEmploymentFactor(
      classData,
      specialFunctionData,
    ),
    schoolManagementBalanceHours:
      totalTeacherActualWorkTime - totalTeacherWorkTime,
  };

  return {
    details,
    summary,
  };
}

