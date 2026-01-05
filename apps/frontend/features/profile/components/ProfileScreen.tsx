"use client";

import { Suspense, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import getNameFromEmailadress from "@/lib/helpers/getNameFromEmailadress";
import { SettingsDialog } from "./SettingsDialog";
import { useUser } from "@clerk/nextjs";
import { hash as md5Hash } from "spark-md5";
import {
  WorkTimeCategory,
  GradeLevel,
  type ClassData,
  type SpecialFunctionData,
} from "@scholatempus/shared";
import { useGetProfile } from "@/features/onboarding/hooks/getProfile";
import { useGetWorkEntries } from "../hooks/useGetWorkEntries";
import { aggregateWorkEntriesByCategory } from "@/lib/helpers/aggregateWorkEntries";
import {
  calculateWorkTimeOverview,
  type WorkTimeOverviewData,
} from "@/lib/helpers/calculateWorkTimeOverview";

interface ProfileScreenProps {
  user: { email: string | null } | null;
  setupData: ClassData;
  schulleitungData: SpecialFunctionData;
}

function getGravatarUrl(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return "https://www.gravatar.com/avatar/?d=mp";
  const digest = md5Hash(normalizedEmail);
  return `https://www.gravatar.com/avatar/${digest}?d=identicon`;
}

// Skeleton component for table loading state
function WorkTimeTableSkeleton() {
  return (
    <>
      {/* Employment factor skeleton */}
      <div className="bg-muted px-3 py-2 rounded">
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Table skeleton */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-300 hover:bg-gray-400">
              <TableHead className="text-black font-medium text-xs h-8">
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead className="text-black font-medium text-xs h-8 text-right">
                <Skeleton className="h-4 w-12 ml-auto" />
              </TableHead>
              <TableHead className="text-black font-medium text-xs h-8 text-right">
                <Skeleton className="h-4 w-12 ml-auto" />
              </TableHead>
              <TableHead className="text-black font-medium text-xs h-8 text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs py-2">
                  <Skeleton className="h-3 w-32" />
                </TableCell>
                <TableCell className="text-xs py-2 text-right">
                  <Skeleton className="h-3 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-xs py-2 text-right">
                  <Skeleton className="h-3 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-xs py-2 text-right">
                  <Skeleton className="h-3 w-12 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary skeleton */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <Skeleton className="h-4 w-32 mb-2" />
        <div className="bg-purple-100 p-3 rounded border mb-3">
          <Skeleton className="h-4 w-48 mb-2" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="bg-yellow-100 p-3 rounded border">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </>
  );
}

export function ProfileScreen({
  user,
}: ProfileScreenProps) {
  const { user: clerkUser } = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [currentSetupData, setCurrentSetupData] = useState<ClassData | undefined>(undefined);
  const [currentSchulleitungData, setCurrentSchulleitungData] =
    useState<SpecialFunctionData | undefined>(undefined);
  const [profileData, setProfileData] = useState({
    name: clerkUser?.firstName || "",
    username: clerkUser?.emailAddresses[0]?.emailAddress || "",
  });

  // Fetch profile and work entries
  const {
    data: profile,
    error: profileError,
  } = useGetProfile();
  const {
    data: workEntries,
  } = useGetWorkEntries();

  // Calculate overview from fetched data
  const overviewData = useMemo<WorkTimeOverviewData | null>(() => {
    if (!profile?.classData || !profile?.specialFunctionData || !workEntries) {
      return null;
    }

    // Transform API response to ClassData and SpecialFunctionData
    const classData: ClassData = {
      grade: profile.classData.grade as GradeLevel,
      givenLectures: profile.classData.givenLectures,
      mandatoryLectures: profile.classData.mandatoryLectures,
      carryOverLectures: profile.classData.carryOverLectures,
    };
    setCurrentSetupData(classData);

    const specialFunctionData: SpecialFunctionData = {
      headshipEmploymentFactor:
        profile.specialFunctionData.headshipEmploymentFactor,
      carryOverLessons: profile.specialFunctionData.carryOverLessons,
      classTeacher: profile.specialFunctionData.classTeacher,
      weeklyLessonsForTransportation:
        profile.specialFunctionData.weeklyLessonsForTransportation,
    };
    setCurrentSchulleitungData(specialFunctionData);
    // Aggregate work entries by category
    const actualHoursPerCategory = aggregateWorkEntriesByCategory(workEntries);

    // Calculate overview
    return calculateWorkTimeOverview(
      classData,
      specialFunctionData,
      actualHoursPerCategory,
    );
  }, [profile, workEntries]);


  const emailAddress = () => {
    if (clerkUser?.primaryEmailAddress?.emailAddress) {
      return clerkUser.primaryEmailAddress.emailAddress;
    }
    return user?.email ?? "";
  };

  const displayName = useMemo(() => {
    if (emailAddress) {
      return getNameFromEmailadress(emailAddress());
    }
    return profileData.name;
  }, [emailAddress, profileData.name]);

  const displayEmail = emailAddress() || profileData.username;

  const avatarImageUrl = useMemo(() => {
    if (clerkUser?.imageUrl) {
      return clerkUser.imageUrl;
    }
    if (emailAddress) {
      return getGravatarUrl(emailAddress());
    }
    return "/teacher.webp";
  }, [clerkUser?.imageUrl, emailAddress]);

  const avatarFallback = useMemo(() => {
    const source = displayName || displayEmail;
    return source ? source.charAt(0).toUpperCase() : "?";
  }, [displayName, displayEmail]);

  const handleSaveSettings = (
    newSetupData: ClassData,
    newSchulleitungData: SpecialFunctionData,
    newProfileData: any,
  ) => {
    // The profile will be automatically refetched via useGetProfile
    // due to query invalidation in useCreateProfile hook
    // This is just for immediate UI update if needed
    setCurrentSetupData(newSetupData);
    setCurrentSchulleitungData(newSchulleitungData);
    setProfileData(newProfileData);
  };

  // Show error state if profile fetch failed (but work entries might still be loading/empty)
  if (profileError && !profile) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Fehler beim Laden des Profils. Bitte versuchen Sie es später
                erneut.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Profil</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-center mb-8">
          <Avatar className="h-20 w-20 mx-auto mb-4">
            <AvatarImage src={avatarImageUrl} alt={displayName} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-foreground">
            {clerkUser?.firstName} {clerkUser?.lastName}
          </h2>
          <p className="text-sm text-muted-foreground">{clerkUser?.emailAddresses[0]?.emailAddress}</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Arbeitszeit Übersicht</CardTitle>
            <CardDescription className="text-pretty">
              Vergleich zwischen Soll-Zustand und Ist-Zustand
            </CardDescription>
          </CardHeader>
          <Suspense fallback={<WorkTimeTableSkeleton />}>
            <CardContent className="space-y-4">
              {overviewData ? (
                <>
                  {/* Total Employment Level */}
                  <div className="bg-green-400 text-black px-3 py-2 rounded font-medium text-sm">
                    Tot. Beschäftigungsgrad:{" "}
                    {overviewData.summary.totalEmploymentFactor.toFixed(2)}%
                  </div>
                  {overviewData.summary.totalEmploymentFactor > 105 && (
                    <div className="bg-red-400 text-black px-3 py-2 rounded font-medium text-sm">
                      Warnung: Beschäftigungsgrad zu hoch!
                    </div>
                  )}

                  <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-300 hover:bg-gray-400">
                      <TableHead className="text-black font-medium text-xs h-8">
                        Kategorie
                      </TableHead>
                      <TableHead className="text-black font-medium text-xs h-8 text-right">
                        Soll
                      </TableHead>
                      <TableHead className="text-black font-medium text-xs h-8 text-right">
                        Ist
                      </TableHead>
                      <TableHead className="text-black font-medium text-xs h-8 text-right">
                        Differenz
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-yellow-300 hover:bg-yellow-400">
                      <TableCell className="text-xs py-2">Schulleitung</TableCell>
                      <TableCell className="text-xs py-2 text-right font-medium">
                        {overviewData.details?.[
                          WorkTimeCategory.SchoolManagement
                        ]?.targetHours.toFixed(0)}
                        h
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right font-medium">
                        {overviewData.details?.[
                          WorkTimeCategory.SchoolManagement
                        ]?.actualHours.toFixed(0)}
                        h
                      </TableCell>
                      <TableCell
                        className={`text-xs py-2 text-right font-medium ${
                          (overviewData.details?.[
                            WorkTimeCategory.SchoolManagement
                          ]?.differenceHours ?? 0) > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {(overviewData.details?.[
                          WorkTimeCategory.SchoolManagement
                        ]?.differenceHours ?? 0) > 0
                          ? "+"
                          : ""}
                        {overviewData.details?.[
                          WorkTimeCategory.SchoolManagement
                        ]?.differenceHours.toFixed(0)}
                        h
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-blue-100 hover:bg-blue-100">
                      <TableCell className="text-xs py-2">
                        Unterrichten, beraten, begleiten
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right font-medium">
                        {overviewData.details?.[
                          WorkTimeCategory.TeachingAdvisingSupporting
                        ]?.targetHours.toFixed(0)}
                        h
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right font-medium">
                        {overviewData.details?.[
                          WorkTimeCategory.TeachingAdvisingSupporting
                        ]?.actualHours.toFixed(0)}
                        h
                      </TableCell>
                      <TableCell
                        className={`text-xs py-2 text-right font-medium ${
                          (overviewData.details?.[
                            WorkTimeCategory.TeachingAdvisingSupporting
                          ]?.differenceHours ?? 0) > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {(overviewData.details?.[
                          WorkTimeCategory.TeachingAdvisingSupporting
                        ]?.differenceHours ?? 0) > 0
                          ? "+"
                          : ""}
                        {overviewData.details?.[
                          WorkTimeCategory.TeachingAdvisingSupporting
                        ]?.differenceHours.toFixed(0)}
                        h
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-blue-100 hover:bg-blue-100">
                      <TableCell className="text-xs py-2">
                        Zusammenarbeit
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right font-medium">
                        {overviewData.details?.[WorkTimeCategory.Collaboration]
                          ?.targetHours.toFixed(0)}
                        h
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right font-medium">
                        {overviewData.details?.[WorkTimeCategory.Collaboration]
                          ?.actualHours.toFixed(0)}
                        h
                      </TableCell>
                      <TableCell
                        className={`text-xs py-2 text-right font-medium ${
                          (overviewData.details?.[WorkTimeCategory.Collaboration]
                            ?.differenceHours ?? 0) > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {(overviewData.details?.[WorkTimeCategory.Collaboration]
                          ?.differenceHours ?? 0) > 0
                          ? "+"
                          : ""}
                        {overviewData.details?.[WorkTimeCategory.Collaboration]
                          ?.differenceHours.toFixed(0)}
                        h
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-blue-100 hover:bg-blue-100">
                      <TableCell className="text-xs py-2">
                        Weiterbildung
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right font-medium">
                        {overviewData.details?.[
                          WorkTimeCategory.FurtherEducation
                        ]?.targetHours.toFixed(0)}
                        h
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right font-medium">
                        {overviewData.details?.[
                          WorkTimeCategory.FurtherEducation
                        ]?.actualHours.toFixed(0)}
                        h
                      </TableCell>
                      <TableCell
                        className={`text-xs py-2 text-right font-medium ${
                          (overviewData.details?.[
                            WorkTimeCategory.FurtherEducation
                          ]?.differenceHours ?? 0) > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {(overviewData.details?.[
                          WorkTimeCategory.FurtherEducation
                        ]?.differenceHours ?? 0) > 0
                          ? "+"
                          : ""}
                        {overviewData.details?.[
                          WorkTimeCategory.FurtherEducation
                        ]?.differenceHours.toFixed(0)}
                        h
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-orange-200 hover:bg-orange-200">
                      <TableCell className="text-xs py-2">
                        Unterrichtskontrolle
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right font-medium">
                        {overviewData.details?.[
                          WorkTimeCategory.TeachingSupervision
                        ]?.targetHours.toFixed(0)}
                        h
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right font-medium">
                        {overviewData.details?.[
                          WorkTimeCategory.TeachingSupervision
                        ]?.actualHours.toFixed(0)}
                        h
                      </TableCell>
                      <TableCell
                        className={`text-xs py-2 text-right font-medium ${
                          (overviewData.details?.[
                            WorkTimeCategory.TeachingSupervision
                          ]?.differenceHours ?? 0) > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {(overviewData.details?.[
                          WorkTimeCategory.TeachingSupervision
                        ]?.differenceHours ?? 0) > 0
                          ? "+"
                          : ""}
                        {overviewData.details?.[
                          WorkTimeCategory.TeachingSupervision
                        ]?.differenceHours.toFixed(0)}
                        h
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium text-sm mb-2">Zusammenfassung</h3>

                <div className="bg-purple-100 p-3 rounded border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold">
                      Arbeitszeit Lehrperson Total
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Soll:</span>
                      <span className="font-medium ml-1">
                        {overviewData.summary.totalTeacherWorkTime.targetHours.toFixed(
                          0,
                        )}
                        h
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ist:</span>
                      <span className="font-medium ml-1">
                        {overviewData.summary.totalTeacherWorkTime.actualHours.toFixed(
                          0,
                        )}
                        h
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bilanz:</span>
                      <span
                        className={`font-bold ml-1 ${
                          overviewData.summary.totalTeacherWorkTime.balanceHours >
                          0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {overviewData.summary.totalTeacherWorkTime.balanceHours >
                        0
                          ? "+"
                          : ""}
                        {overviewData.summary.totalTeacherWorkTime.balanceHours.toFixed(
                          0,
                        )}
                        h
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-100 p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold">
                      Az Schulleitung Bilanz
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        overviewData.summary.schoolManagementBalanceHours > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {overviewData.summary.schoolManagementBalanceHours > 0
                        ? "+"
                        : ""}
                      {overviewData.summary.schoolManagementBalanceHours.toFixed(0)}
                      h
                    </span>
                  </div>
                </div>
              </div>
              </>
            ) : <WorkTimeTableSkeleton />}
            </CardContent>
          </Suspense>
        </Card>

        <SettingsDialog
          open={showSettings}
          onOpenChangeAction={setShowSettings}
          setupData={currentSetupData}
          schulleitungData={currentSchulleitungData}
          onSaveAction={handleSaveSettings}
        />
      </div>
    </div>
  );
}
