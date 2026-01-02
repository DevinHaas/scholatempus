import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { useState, useEffect } from "react";
import { getHourseMultiplierPerCategory } from "../helpers/SetupCalculators";
import { HOURS_TO_WORK_PER_SEMESTER, NUMBER_OF_SCHOOL_WEEKS } from "../DATA";
import {
  ClassData,
  GradeLevel,
  SpecialFunctionData,
  WeeklyLessonsForTransportation,
  WorkTimeCategory,
} from "@scholatempus/shared";

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
      const multiplier = getHourseMultiplierPerCategory(category);

      let targetHours: number = 0;
      if (category == WorkTimeCategory.SchoolManagement) {
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

      const actualHours =
        workTimeOverviewData.details?.[category]?.actualHours ?? 0;
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
    workTimeOverviewData.details?.[WorkTimeCategory.TeachingSupervision]
      ?.actualHours ?? 0;
  details[WorkTimeCategory.TeachingSupervision] = {
    targetHours: teachingSupervisionTargetHours,
    actualHours: actualTeachingSupervisionHours,
    differenceHours:
      actualTeachingSupervisionHours - teachingSupervisionTargetHours,
  };

  workTimeOverviewData.summary = {
    totalTeacherWorkTime: {
      targetHours: totalTeacherWorkTime,
      actualHours: totalTeacherActualWorkTime,
      balanceHours: totalTeacherActualWorkTime - totalTeacherWorkTime,
    },
    totalEmploymentFactor: calculateTotatlEmploymentFactor(
      classData,
      specialFunctionData,
    ),
    schoolManagementBalanceHours:
      totalTeacherActualWorkTime - totalTeacherWorkTime,
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

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false); // Start with false during SSR

  useEffect(() => {
    if (!useProfileDataStore.persist) {
      setHydrated(true); // No persist = no hydration needed
      return;
    }

    setHydrated(useProfileDataStore.persist.hasHydrated());

    const unsubscribe = useProfileDataStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return unsubscribe;
  }, []);

  return hydrated;
};
