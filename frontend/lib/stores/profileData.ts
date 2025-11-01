import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { GradeLevel } from "../enums/grade";
import { WorkTimeCategory } from "../enums/workTimeCategory";
import { getHourseMultiplierPerCategory } from "../helpers/OverviewDataCalculators";
import {
  ClassData,
  SpecialFunctionData,
  WeeklyLessonsForTransportation,
} from "../schemas";
import { NUMBER_OF_SCHOOL_WEEKS } from "../DATA";

interface WorkTimeDetail {
  targetHours: number | null;
  actualHours: number;
  differenceHours: number;
}

interface WorkTimeSummary {
  totalTeacherWorkTime: {
    targetHours: number;
    actualHours: number;
    balanceHours: number;
  };
  totalEmploymentFactor: number;
  schoolManagementBalanceHours: number;
}
type WorkedTimePerCategory = Record<WorkTimeCategory, WorkTimeDetail>;

interface WorkTimeOverviewData {
  details: WorkedTimePerCategory | undefined;
  summary: WorkTimeSummary;
}

const initialClassData: ClassData = {
  grade: GradeLevel.PrimarySchoolGymnasiumEntry, // Default, adjust as needed
  givenLectures: 0,
  mandatoryLectures: 28,
  carryOverLectures: 0,
};

const initialSpecialFunctionData: SpecialFunctionData = {
  headshipEmploymentFactor: 0,
  carryOverLessons: 0,
  classTeacher: false,
  weeklyLessonsForTransportation: 0 as WeeklyLessonsForTransportation,
};

const initialWorkTimeOverviewData: WorkTimeOverviewData = {
  details: undefined,
  summary: {
    totalTeacherWorkTime: { targetHours: 0, actualHours: 0, balanceHours: 0 },
    totalEmploymentFactor: 0,
    schoolManagementBalanceHours: 0,
  },
};

const calculateTargetOverviewParams = (
  classData: ClassData,
  specialFunctionData: SpecialFunctionData,
  workTimeOverviewData: WorkTimeOverviewData,
): WorkTimeOverviewData => {
  const lecturesShouldPerSemester =
    (classData.mandatoryLectures * classData.givenLectures) / 2;

  let totalTeacherWorkTime = 0;
  let totalTeacherActualWorkTime = 0;
  const details = Object.values(WorkTimeCategory)
    .filter((c) => c !== WorkTimeCategory.TeachingSupervision)
    .reduce<WorkedTimePerCategory>((acc, category) => {
      console.log("category", category);
      const multiplier = getHourseMultiplierPerCategory(category);

      const targetHours = multiplier * lecturesShouldPerSemester;
      totalTeacherWorkTime += targetHours;

      const actualHours =
        workTimeOverviewData.details?.[category]?.actualHours ?? 0;
      totalTeacherActualWorkTime += actualHours;

      acc[category] = {
        targetHours,
        actualHours,
        differenceHours: targetHours - actualHours,
      };

      return acc;
    }, {} as WorkedTimePerCategory);

  const teachingSupervisionTargetHours =
    (NUMBER_OF_SCHOOL_WEEKS * classData.givenLectures) / 2;

  const actualTeachingSupervisionHours =
    workTimeOverviewData.details?.[WorkTimeCategory.TeachingSupervision]
      ?.actualHours ?? 0;
  details[WorkTimeCategory.TeachingSupervision] = {
    targetHours: teachingSupervisionTargetHours,
    actualHours: actualTeachingSupervisionHours,
    differenceHours:
      teachingSupervisionTargetHours - actualTeachingSupervisionHours,
  };

  workTimeOverviewData.summary = {
    totalTeacherWorkTime: {
      targetHours: totalTeacherWorkTime,
      actualHours: totalTeacherActualWorkTime,
      balanceHours: totalTeacherWorkTime - totalTeacherActualWorkTime,
    },
    totalEmploymentFactor: calculateTotatlEmploymentFactor(
      classData,
      specialFunctionData,
    ),
    schoolManagementBalanceHours:
      totalTeacherWorkTime - totalTeacherActualWorkTime,
  };

  return {
    ...workTimeOverviewData,
    details,
  };
};

const calculateTotatlEmploymentFactor = (
  classData: ClassData,
  specialFunctionData: SpecialFunctionData,
) => {
  return (
    (100 / classData.mandatoryLectures) * classData.givenLectures +
    specialFunctionData.headshipEmploymentFactor +
    (specialFunctionData.classTeacher ? 5 : 0)
  );
};

interface ProfileDataState {
  classData: ClassData;
  specialFunctionData: SpecialFunctionData;
  workTimeOverviewData: WorkTimeOverviewData;
  updateClassData: (newClassData: ClassData) => void;
  updateSpecialFunctionData: (
    newSpecialFunctionData: SpecialFunctionData,
  ) => void;
  updateWorkTimeSummary: (
    newClassData: ClassData,
    newSpecialFunctionData: SpecialFunctionData,
    newWorktimeOverviewData: WorkTimeOverviewData,
  ) => void;
}

const useProfileDataStore = create<ProfileDataState>()(
  persist(
    (set, get) => ({
      classData: initialClassData,
      specialFunctionData: initialSpecialFunctionData,
      workTimeOverviewData: initialWorkTimeOverviewData,
      updateClassData: (newClassData) =>
        set((state) => {
          const newClassDataState = {
            ...state.classData,
            ...newClassData,
          };
          console.log("class data" + newClassData);

          const newWorkTimeOverviewData = calculateTargetOverviewParams(
            newClassDataState,
            state.specialFunctionData,
            state.workTimeOverviewData,
          );

          return {
            classData: newClassDataState,
            workTimeOverviewData: newWorkTimeOverviewData,
          };
        }),
      updateSpecialFunctionData: (newSpecialFunctionData) =>
        set((state) => {
          const newSpecialFunctionDataState = {
            ...state.specialFunctionData,
            ...newSpecialFunctionData,
          };

          const newWorkTimeOverviewData = calculateTargetOverviewParams(
            state.classData,
            newSpecialFunctionDataState,
            state.workTimeOverviewData,
          );

          return {
            specialFunctionData: newSpecialFunctionDataState,
            workTimeOverviewData: newWorkTimeOverviewData,
          };
        }),
      updateWorkTimeSummary: (
        newClassData,
        newSpecialFunctionData,
        workTimeOverviewData,
      ) =>
        set(() => {
          const newWorkTimeOverviewData = calculateTargetOverviewParams(
            newClassData,
            newSpecialFunctionData,
            workTimeOverviewData,
          );

          console.log(newWorkTimeOverviewData);

          return {
            workTimeOverviewData: newWorkTimeOverviewData,
          };
        }),
    }),
    {
      name: "scholatempus:onboarding",
      partialize: (state) => ({
        classData: state.classData,
        specialFunctionData: state.specialFunctionData,
        workTimeOverviewData: state.workTimeOverviewData,
      }),
    },
  ),
);

export const useProfileDataActions = () =>
  useProfileDataStore(
    useShallow((state) => ({
      updateClassData: state.updateClassData,
      updateSpecialFunctionData: state.updateSpecialFunctionData,
      updateWorkTimeSummary: state.updateWorkTimeSummary,
    })),
  );
export const useClassData = () =>
  useProfileDataStore((state) => state.classData);
export const useSpecialFunctionData = () =>
  useProfileDataStore((state) => state.specialFunctionData);
export const useWorkTimeOverview = () =>
  useProfileDataStore((state) => state.workTimeOverviewData);
