export enum WorkTimeCategory {
  SchoolManagement = "Schulleitung",
  TeachingAdvisingSupporting = "Unterrichten, beraten, begleiten",
  Collaboration = "Zusammenarbeit",
  FurtherEducation = "Weiterbildung",
  TeachingSupervision = "Unterrichtskontrolle",
}

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
