import { create } from "zustand";
import { GradeLevel } from "../enums/grade";
import { WorkTimeCategory } from "../enums/workTimeCategory";
import { getHourseMultiplierPerCategory } from "../helpers/OverviewDataCalculators";

type WeeklyLessonsForTransportation = 0 | 0.5 | 1 | 1.5 | 2;

export interface ClassData {
  grade: GradeLevel;
  givenLectures: number;
  mandatoryLectures: number;
  carryOverLessons: number;
}

interface SpecialFunctionData {
  headshipEmploymentFactors: number;
  carryOverLessons: number;
  classTeacher: boolean;
  weeklyLessonsForTransportation: WeeklyLessonsForTransportation;
}

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
  schoolManagementBalanceHours: number;
}
type WorkedTimePerCategory = Record<WorkTimeCategory, WorkTimeDetail>;

interface WorkTimeOverviewData {
  details: WorkedTimePerCategory | undefined;
  summary: WorkTimeSummary;
}

interface ProfileDataState {
  classData: ClassData;
  specialFunctionData: SpecialFunctionData;
  workTimeOverviewData: WorkTimeOverviewData;
  actions: ProfileDataActions;
}

interface ProfileDataActions {
  updateClassData: (newClassData: ClassData) => void;
  // updateSpecialFunctionData: (
  //   newSpecialFunctionData: SpecialFunctionData,
  // ) => void;
  // updateWorkTimeSummary: (
  //   newClassData: ClassData,
  //   newSpecialFunctionData: SpecialFunctionData,
  // ) => void;
}

const initialClassData: ClassData = {
  grade: GradeLevel.PrimarySchoolGymnasiumEntry, // Default, adjust as needed
  givenLectures: 0,
  mandatoryLectures: 28,
  carryOverLessons: 0,
};

const initialSpecialFunctionData: SpecialFunctionData = {
  headshipEmploymentFactors: 0,
  carryOverLessons: 0,
  classTeacher: false,
  weeklyLessonsForTransportation: 0, // Default, adjust as needed
};

const initialWorkTimeOverviewData: WorkTimeOverviewData = {
  details: undefined,
  summary: {
    totalTeacherWorkTime: { targetHours: 0, actualHours: 0, balanceHours: 0 },
    schoolManagementBalanceHours: 0,
  },
};

const calculateTargetOverviewParams = (
  classData: ClassData,
  specialFunctionData: SpecialFunctionData,
) => {
  const lecturesShouldPerSemester =
    (classData.mandatoryLectures * classData.givenLectures) / 2;

  for (let item in WorkTimeCategory) {
    const targetHours = getHourseMultiplierPerCategory(item);
    const element: WorkTimeDetail = {
      targetHours: targetHours,
      actualHours: 0,
      differenceHours: 5,
    };
  }
};

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
  },
}));

export const useProfileDataActions = () =>
  useProfileDataStore((state) => state.actions);
export const useWorkTimeOverview = () =>
  useProfileDataStore((state) => state.workTimeOverviewData);
