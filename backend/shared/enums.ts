export enum WorkTimeCategory {
  SchoolManagement = "SchoolManagement",
  TeachingAdvisingSupporting = "TeachingAdvisingSupporting",
  Collaboration = "Collaboration",
  FurtherEducation = "FurtherEducation",
  TeachingSupervision = "TeachingSupervision",
}

export enum WorkTimeSubCategory {
  Class = "Class",
  Preparation = "Preparation",
  Supporting = "Supporting",
}

// Keep the old type alias for backward compatibility during migration
export type WORKTIME_SUBCATEGORIES = WorkTimeSubCategory;

// Short enum values for database (under 63 chars)
export enum GradeLevel {
  PrimarySchoolGymnasiumEntry = "PRIMARY_SCHOOL_GYM",
  VocationalPrepYearPreApprenticeshipFull = "VOC_PREP_FULL",
  VocationalPrepYearPractical = "VOC_PREP_PRACT",
  CommercialMiddleVocationalExtended = "COMM_MID_VOC_EXT",
  VocationalBaccalaureateSpecialized = "VOC_BACC_SPEC",
  GymnasiumAcademicTrack = "GYMNASIUM_ACADEMIC",
}

// Display labels (can move to DB later for i18n)
export const WORK_TIME_CATEGORY_LABELS: Record<WorkTimeCategory, string> = {
  [WorkTimeCategory.SchoolManagement]: "Schulleitung",
  [WorkTimeCategory.TeachingAdvisingSupporting]:
    "Unterrichten, beraten, begleiten",
  [WorkTimeCategory.Collaboration]: "Zusammenarbeit",
  [WorkTimeCategory.FurtherEducation]: "Weiterbildung",
  [WorkTimeCategory.TeachingSupervision]: "Unterrichtskontrolle",
};

export const TEACHING_ADVINSING_SUPPORTING_SUBCATEGORIES_LABELS: Record<
  WorkTimeSubCategory,
  string
> = {
  [WorkTimeSubCategory.Class]: "Unterricht",
  [WorkTimeSubCategory.Preparation]: "Vor- und Nachbereitung",
  [WorkTimeSubCategory.Supporting]: "Beraten, begleiten",
};

export const GRADE_LEVEL_LABELS: Record<GradeLevel, string> = {
  [GradeLevel.PrimarySchoolGymnasiumEntry]:
    "Volksschule (inkl. Erstes Jahr des gymnasialen Bildungsganges)",
  [GradeLevel.VocationalPrepYearPreApprenticeshipFull]:
    "Berufsvorbereitendes Schuljahr, Vorlehren (theoretischer und praktischer* Unterricht)",
  [GradeLevel.VocationalPrepYearPractical]:
    "Berufsvorbereitendes Schuljahr (praktischer* Unterricht)",
  [GradeLevel.CommercialMiddleVocationalExtended]:
    "Handelsmittelschule, Lehrwerkstätte (theoretischer Unterricht), Berufsschule inkl. Berufliche Weiterbildung",
  [GradeLevel.VocationalBaccalaureateSpecialized]:
    "Berufsmaturitätsschule, Fachmittelschule, Berufsmaturitätsunterricht an Handelsmittelschulen",
  [GradeLevel.GymnasiumAcademicTrack]:
    "Gymnasium (10.-12. Schuljahr bzw. 12. – 14. Schuljahr gemäss Harmos)",
};
