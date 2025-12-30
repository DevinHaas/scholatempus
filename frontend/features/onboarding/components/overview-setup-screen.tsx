"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import getNameFromEmailadress from "@/lib/helpers/getNameFromEmailadress";
import { useWorkTimeOverview, useHydration } from "@/lib/stores/profileData";
import { ArrowLeft } from "lucide-react";
import { WorkTimeCategory } from "scholatempus-backend/shared";
import { Spinner } from "../../../components/ui/spinner";

interface OverviewScreenProps {
  onCompleteAction: () => void;
  onBackAction: () => void;
  email: string;
  mutationIsPending: boolean;
}

// Skeleton component for loading state
function OverviewScreenSkeleton({
  onBackAction,
}: {
  onBackAction: () => void;
}) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={onBackAction}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Skeleton className="h-7 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Employment factor skeleton */}
            <div className="bg-muted px-3 py-2 rounded">
              <Skeleton className="h-4 w-48" />
            </div>

            {/* Table skeleton */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs py-2">
                        <Skeleton className="h-3 w-24" />
                      </TableCell>
                      <TableCell className="text-xs py-2">
                        <Skeleton className="h-3 w-20" />
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right">
                        <Skeleton className="h-3 w-12 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Buttons skeleton */}
            <div className="flex gap-3 pt-4">
              <Skeleton className="flex-1 h-11" />
              <Skeleton className="flex-1 h-11" />
            </div>
          </CardContent>
        </Card>

        <Skeleton className="h-3 w-72 mx-auto" />
      </div>
    </div>
  );
}

export function OverviewScreen({
  onCompleteAction,
  onBackAction,
  email,
  mutationIsPending,
}: OverviewScreenProps) {
  const overviewData = useWorkTimeOverview();
  const hydrated = useHydration();

  // Show skeleton while data is loading from localStorage
  if (!hydrated || !overviewData.details) {
    return <OverviewScreenSkeleton onBackAction={onBackAction} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={onBackAction}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Einrichtung
            </h1>
            <p className="text-sm text-muted-foreground">
              Willkommen, {getNameFromEmailadress(email)}
            </p>
          </div>
        </div>
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Overview</CardTitle>
            <CardDescription className="text-pretty">
              Dies ist eine Übersicht über die errechneten Soll Zustände
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {/* Calculations Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow className="bg-yellow-400 hover:bg-yellow-400">
                    <TableCell className="text-xs py-2">
                      AZ Schulleitung
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      Stunden Soll :
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {overviewData.details?.[
                        WorkTimeCategory.SchoolManagement
                      ].targetHours?.toFixed(0)}
                    </TableCell>
                  </TableRow>

                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                    <TableCell className="text-xs py-2">
                      AZ LP Unterrichten, beraten, begleiten:
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      Stunden Soll (85%):
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {overviewData.details?.[
                        WorkTimeCategory.TeachingAdvisingSupporting
                      ].targetHours?.toFixed(0)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                    <TableCell className="text-xs py-2">
                      AZ LP Zusammenarbeit:
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      Stunden Soll (12%):
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {overviewData.details?.[
                        WorkTimeCategory.Collaboration
                      ].targetHours?.toFixed(0)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-100 hover:bg-blue-100">
                    <TableCell className="text-xs py-2">
                      AZ LP Weiterbildung:
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      Stunden Soll (3%):
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {overviewData.details?.[
                        WorkTimeCategory.FurtherEducation
                      ].targetHours?.toFixed(0)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-orange-200 hover:bg-orange-200">
                    <TableCell className="text-xs py-2">
                      Unterrichtskontrolle LP:
                    </TableCell>
                    <TableCell className="text-xs py-2">
                      Lektionen Soll:
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right font-medium">
                      {
                        overviewData.details?.[
                          WorkTimeCategory.TeachingSupervision
                        ].targetHours
                      }
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 bg-transparent"
                onClick={onBackAction}
              >
                Back
              </Button>
              <Button className="flex-1 h-11" onClick={onCompleteAction}>
                {mutationIsPending && <Spinner className="mr-2" />}
                Finish
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          Diese Berechnungen basieren auf den eingegebenen Daten und können in
          der Anwendung angepasst werden.
        </div>
      </div>
    </div>
  );
}
