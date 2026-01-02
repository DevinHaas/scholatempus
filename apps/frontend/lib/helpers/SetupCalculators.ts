import { GradeLevel, WorkTimeCategory } from "@scholatempus/shared";

export function calculateMandatoryLectures(gradeLevel: GradeLevel): number[] {
  switch (gradeLevel) {
    case GradeLevel.PrimarySchoolGymnasiumEntry: {
      return [28, 29];
    }
    case GradeLevel.VocationalPrepYearPreApprenticeshipFull: {
      return [26, 27];
    }
    case GradeLevel.VocationalPrepYearPractical: {
      return [35, 36];
    }
    case GradeLevel.CommercialMiddleVocationalExtended: {
      return [25, 26];
    }
    case GradeLevel.VocationalBaccalaureateSpecialized: {
      return [24, 24.5];
    }

    case GradeLevel.GymnasiumAcademicTrack: {
      return [23, 23.5];
    }
    default:
      throw Error(`no mapping found for this gradelevel ${gradeLevel}`);
  }
}

export function getHourseMultiplierPerCategory(category: string): number {
  switch (category) {
    case WorkTimeCategory.TeachingAdvisingSupporting:
      return 0.85;
    case WorkTimeCategory.Collaboration:
      return 0.12;
    case WorkTimeCategory.FurtherEducation:
      return 0.03;
    case WorkTimeCategory.SchoolManagement:
      return 1;
    default:
      throw new Error(`unknown category ${category}`);
  }
}
