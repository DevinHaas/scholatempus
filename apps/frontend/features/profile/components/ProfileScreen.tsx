"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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
import { WorkTimeCategory, GradeLevel } from "@scholatempus/shared/enums";
import type {
  ClassData,
  SpecialFunctionData,
} from "@scholatempus/shared/schemas";
import { useGetProfile } from "@/features/onboarding/hooks/getProfile";
import { useGetWorkEntries } from "../hooks/useGetWorkEntries";
import { aggregateWorkEntriesByCategory } from "@/lib/helpers/aggregateWorkEntries";
import {
  calculateWorkTimeOverview,
  type WorkTimeOverviewData,
} from "@/lib/helpers/calculateWorkTimeOverview";

interface ProfileScreenProps {
  user: { email: string | null } | null;
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
      <div className="border rounded-lg overflow-x-auto">
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

export function ProfileScreen({ user }: ProfileScreenProps) {
  const { user: clerkUser } = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const [currentSetupData, setCurrentSetupData] = useState<
    ClassData | undefined
  >(undefined);
  const [currentSchulleitungData, setCurrentSchulleitungData] = useState<
    SpecialFunctionData | undefined
  >(undefined);
  const [profileData, setProfileData] = useState({
    name: clerkUser?.firstName || "",
    username: clerkUser?.emailAddresses[0]?.emailAddress || "",
  });
  const [overviewData, setOverviewData] = useState<WorkTimeOverviewData | null>(
    null,
  );

  // Fetch profile and work entries
  const { data: profile, error: profileError } = useGetProfile();
  const { data: workEntries } = useGetWorkEntries();

  // Sync profile data to state and recompute overview on load / refetch
  useEffect(() => {
    if (!profile?.classData || !profile?.specialFunctionData) return;
    const setupData: ClassData = {
      grade: profile.classData.grade as GradeLevel,
      givenLectures: profile.classData.givenLectures,
      mandatoryLectures: profile.classData.mandatoryLectures,
      carryOverLectures: profile.classData.carryOverLectures,
    };
    const schulleitungData: SpecialFunctionData = {
      headshipEmploymentFactor:
        profile.specialFunctionData.headshipEmploymentFactor,
      carryOverLessons: profile.specialFunctionData.carryOverLessons,
      classTeacher: profile.specialFunctionData.classTeacher,
      weeklyLessonsForTransportation:
        profile.specialFunctionData.weeklyLessonsForTransportation,
    };
    setCurrentSetupData(setupData);
    setCurrentSchulleitungData(schulleitungData);
    if (workEntries) {
      const actualHoursPerCategory =
        aggregateWorkEntriesByCategory(workEntries);
      setOverviewData(
        calculateWorkTimeOverview(
          setupData,
          schulleitungData,
          actualHoursPerCategory,
        ),
      );
    }
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
    setCurrentSetupData(newSetupData);
    setCurrentSchulleitungData(newSchulleitungData);
    setProfileData(newProfileData);
    if (workEntries) {
      const actualHoursPerCategory =
        aggregateWorkEntriesByCategory(workEntries);
      setOverviewData(
        calculateWorkTimeOverview(
          newSetupData,
          newSchulleitungData,
          actualHoursPerCategory,
        ),
      );
    }
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
    <div className="bg-background p-4 pb-24">
      <div className="max-w-md mx-auto ">
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

        <div className="text-center mb-4 sm:mb-8">
          <Avatar className="h-14 w-14 sm:h-20 sm:w-20 mx-auto mb-2 sm:mb-4">
            <AvatarImage src={avatarImageUrl} alt={displayName} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <h2 className="text-base sm:text-xl font-semibold text-foreground">
            {clerkUser?.firstName} {clerkUser?.lastName}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {clerkUser?.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        <Card className="border-border/50 shadow-lg gap-1 py-2">
          <CardHeader className="gap-0 pb-2">
            <CardTitle className="text-md p-0 md:text-lg">
              Arbeitszeit Übersicht
            </CardTitle>
            <CardDescription>Soll-Zustand vs. Ist-Zustand</CardDescription>
          </CardHeader>
          <Suspense fallback={<WorkTimeTableSkeleton />}>
            <CardContent className="space-y-4 pt-0">
              {overviewData ? (
                <>
                  {/* Employment badge */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        overviewData.summary.totalEmploymentFactor > 105
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          overviewData.summary.totalEmploymentFactor > 105
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                      />
                      Beschäftigungsgrad:{" "}
                      {overviewData.summary.totalEmploymentFactor.toFixed(0)}%
                    </span>
                  </div>

                  {/* Table */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-muted-foreground text-xs h-7 px-2">
                            Kategorie
                          </TableHead>
                          <TableHead className="text-muted-foreground text-xs h-7 px-2 text-right">
                            Soll
                          </TableHead>
                          <TableHead className="text-muted-foreground text-xs h-7 px-2 text-right">
                            Ist
                          </TableHead>
                          <TableHead className="text-muted-foreground text-xs h-7 px-2 text-right">
                            Diff.
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-yellow-50">
                          <TableCell className="text-xs py-2 px-2 font-medium">
                            Schulleitung
                          </TableCell>
                          <TableCell className="text-xs py-2 px-2 text-right">
                            {overviewData.details?.[
                              WorkTimeCategory.SchoolManagement
                            ]?.targetHours.toFixed(0)}
                            h
                          </TableCell>
                          <TableCell className="text-xs py-2 px-2 text-right">
                            {overviewData.details?.[
                              WorkTimeCategory.SchoolManagement
                            ]?.actualHours.toFixed(0)}
                            h
                          </TableCell>
                          <TableCell
                            className={`text-xs py-2 px-2 text-right font-semibold ${
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

                        <TableRow>
                          <TableCell className="text-xs py-2 px-2">
                            Unterrichten
                          </TableCell>
                          <TableCell className="text-xs py-2 px-2 text-right">
                            {overviewData.details?.[
                              WorkTimeCategory.TeachingAdvisingSupporting
                            ]?.targetHours.toFixed(0)}
                            h
                          </TableCell>
                          <TableCell className="text-xs py-2 px-2 text-right">
                            {overviewData.details?.[
                              WorkTimeCategory.TeachingAdvisingSupporting
                            ]?.actualHours.toFixed(0)}
                            h
                          </TableCell>
                          <TableCell
                            className={`text-xs py-2 px-2 text-right font-semibold ${
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

                        <TableRow>
                          <TableCell className="text-xs py-2 px-2">
                            Zusammenarbeit
                          </TableCell>
                          <TableCell className="text-xs py-2 px-2 text-right">
                            {overviewData.details?.[
                              WorkTimeCategory.Collaboration
                            ]?.targetHours.toFixed(0)}
                            h
                          </TableCell>
                          <TableCell className="text-xs py-2 px-2 text-right">
                            {overviewData.details?.[
                              WorkTimeCategory.Collaboration
                            ]?.actualHours.toFixed(0)}
                            h
                          </TableCell>
                          <TableCell
                            className={`text-xs py-2 px-2 text-right font-semibold ${
                              (overviewData.details?.[
                                WorkTimeCategory.Collaboration
                              ]?.differenceHours ?? 0) > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {(overviewData.details?.[
                              WorkTimeCategory.Collaboration
                            ]?.differenceHours ?? 0) > 0
                              ? "+"
                              : ""}
                            {overviewData.details?.[
                              WorkTimeCategory.Collaboration
                            ]?.differenceHours.toFixed(0)}
                            h
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell className="text-xs py-2 px-2">
                            Weiterbildung
                          </TableCell>
                          <TableCell className="text-xs py-2 px-2 text-right">
                            {overviewData.details?.[
                              WorkTimeCategory.FurtherEducation
                            ]?.targetHours.toFixed(0)}
                            h
                          </TableCell>
                          <TableCell className="text-xs py-2 px-2 text-right">
                            {overviewData.details?.[
                              WorkTimeCategory.FurtherEducation
                            ]?.actualHours.toFixed(0)}
                            h
                          </TableCell>
                          <TableCell
                            className={`text-xs py-2 px-2 text-right font-semibold ${
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

                        <TableRow className="bg-orange-50">
                          <TableCell className="text-xs py-2 px-2 font-medium">
                            Unterrichtskontrolle
                          </TableCell>
                          <TableCell className="text-xs py-2 px-2 text-right">
                            {overviewData.details?.[
                              WorkTimeCategory.TeachingSupervision
                            ]?.targetHours.toFixed(0)}
                            h
                          </TableCell>
                          <TableCell className="text-xs py-2 px-2 text-right">
                            {overviewData.details?.[
                              WorkTimeCategory.TeachingSupervision
                            ]?.actualHours.toFixed(0)}
                            h
                          </TableCell>
                          <TableCell
                            className={`text-xs py-2 px-2 text-right font-semibold ${
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

                  {/* Summary */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-semibold text-foreground">
                      Zusammenfassung — Lehrperson Total
                    </p>
                    <div className="bg-card rounded-md border border-border p-2.5 grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Soll
                        </p>
                        <p className="text-sm font-bold">
                          {overviewData.summary.totalTeacherWorkTime.targetHours.toFixed(
                            0,
                          )}
                          h
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Ist
                        </p>
                        <p className="text-sm font-bold">
                          {overviewData.summary.totalTeacherWorkTime.actualHours.toFixed(
                            0,
                          )}
                          h
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Bilanz
                        </p>
                        <p
                          className={`text-sm font-bold ${
                            overviewData.summary.totalTeacherWorkTime
                              .balanceHours > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {overviewData.summary.totalTeacherWorkTime
                            .balanceHours > 0
                            ? "+"
                            : ""}
                          {overviewData.summary.totalTeacherWorkTime.balanceHours.toFixed(
                            0,
                          )}
                          h
                        </p>
                      </div>
                    </div>
                    <div className="bg-card rounded-md border border-border p-2.5 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
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
                        {overviewData.summary.schoolManagementBalanceHours.toFixed(
                          0,
                        )}
                        h
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <WorkTimeTableSkeleton />
              )}
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
