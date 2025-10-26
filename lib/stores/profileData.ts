import { create } from "zustand";
import { GradeLevel } from "../enums/grade";
import { WorkTimeCategory } from "../enums/workTimeCategory";
import { getHourseMultiplierPerCategory } from "../helpers/OverviewDataCalculators";
import {
  ClassData,
  SpecialFunctionData,
  WeeklyLessonsForTransportation,
} from "../schemas";

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

interface ProfileDataActions {
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
  const details = Object.values(WorkTimeCategory).reduce<WorkedTimePerCategory>(
    (acc, category) => {
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
    },
    {} as WorkedTimePerCategory,
  );

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
  actions: ProfileDataActions;
}

const useProfileDataStore = create<ProfileDataState>()((set) => ({
  classData: initialClassData,
  specialFunctionData: initialSpecialFunctionData,
  workTimeOverviewData: initialWorkTimeOverviewData,
  actions: {
    updateClassData: (newClassData) =>
      set((state) => {
        const newClassDataState = {
          ...state.classData,
          ...newClassData,
        };
        console.log("class data" + newClassData);

        return { ...state, classData: newClassDataState };
      }),
    updateSpecialFunctionData: (newSpecialFunctionData) =>
      set((state) => {
        const newSpecialFunctionDataState = {
          ...state.specialFunctionData,
          ...newSpecialFunctionData,
        };
        return { ...state, specialFunctionData: newSpecialFunctionDataState };
      }),

    updateWorkTimeSummary: (newClassData, workTimeOverviewData) =>
      set((state) => {
        const newWorkTimeOverviewData = calculateTargetOverviewParams(
          newClassData,
          workTimeOverviewData,
        );

        return {
          ...state,
          workTimeOverviewData: newWorkTimeOverviewData,
        };
      }),
  },
}));

export const useProfileDataActions = () =>
  useProfileDataStore((state) => state.actions);
export const useWorkTimeOverview = () =>
  useProfileDataStore((state) => state.workTimeOverviewData);
